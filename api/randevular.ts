import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from './_lib/mongodb'
import { istekSahibi } from './_lib/auth'
import { govdeOku, hata, mapId, tekParam, toObjectId } from './_lib/util'

const GECERLI_DURUM = ['beklemede', 'onaylandi', 'reddedildi', 'tamamlandi', 'iptal']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const s = await istekSahibi(req)
    if (!s) return hata(res, 401, 'Oturum gerekli.')

    const db = await getDb()
    const kol = db.collection('randevular')

    // --- Listele (role gore filtreli) ---
    if (req.method === 'GET') {
      let filtre: Record<string, unknown> = {}
      if (s.rol === 'vatandas') filtre = { vatandasId: s.id }
      else if (s.rol === 'personel') filtre = { doktorId: s.id }
      // admin: tum randevular
      const liste = await kol.find(filtre).sort({ olusturmaTarihi: -1 }).toArray()
      return res.status(200).json(liste.map(mapId))
    }

    // --- Olustur (yalniz vatandas) ---
    if (req.method === 'POST') {
      if (s.rol !== 'vatandas') {
        return hata(res, 403, 'Sadece vatandaşlar randevu oluşturabilir.')
      }
      const v = govdeOku(req)
      const doktorId = String(v.doktorId ?? '')
      const tarih = String(v.tarih ?? '').trim()
      const saat = String(v.saat ?? '').trim()
      const sikayet = String(v.sikayet ?? '').trim()
      if (!doktorId || !tarih || !saat) {
        return hata(res, 400, 'Doktor, tarih ve saat zorunludur.')
      }
      const dOid = toObjectId(doktorId)
      const doktor = dOid
        ? await db.collection('personeller').findOne({ _id: dOid })
        : null
      if (!doktor) return hata(res, 400, 'Geçersiz doktor seçimi.')

      const yeni = {
        vatandasId: s.id,
        vatandasAdi: s.dok.adSoyad ?? '',
        vatandasTelefon: s.dok.telefon ?? '',
        doktorId,
        doktorAdi: doktor.adSoyad ?? '',
        tarih,
        saat,
        sikayet,
        durum: 'beklemede',
        doktorNotu: '',
        olusturmaTarihi: new Date().toISOString(),
      }
      const r = await kol.insertOne(yeni)
      const dok = await kol.findOne({ _id: r.insertedId })
      return res.status(201).json(mapId(dok))
    }

    // --- Guncelle (durum / not) ---
    if (req.method === 'PATCH') {
      const id = tekParam(req.query.id)
      if (!id) return hata(res, 400, 'id parametresi gerekli.')
      const oid = toObjectId(id)
      if (!oid) return hata(res, 400, 'Geçersiz id.')
      const randevu = await kol.findOne({ _id: oid })
      if (!randevu) return hata(res, 404, 'Randevu bulunamadı.')

      const v = govdeOku(req)
      const guncelle: Record<string, unknown> = {}

      if (s.rol === 'vatandas') {
        if (randevu.vatandasId !== s.id) return hata(res, 403, 'Bu işlem için yetkiniz yok.')
        // Vatandas yalnizca kendi randevusunu iptal edebilir
        guncelle.durum = 'iptal'
      } else {
        const yetkili = s.rol === 'admin' || randevu.doktorId === s.id
        if (!yetkili) return hata(res, 403, 'Bu işlem için yetkiniz yok.')
        if (v.durum !== undefined) {
          if (!GECERLI_DURUM.includes(String(v.durum))) {
            return hata(res, 400, 'Geçersiz randevu durumu.')
          }
          guncelle.durum = String(v.durum)
        }
        if (v.doktorNotu !== undefined) guncelle.doktorNotu = String(v.doktorNotu)
      }

      if (Object.keys(guncelle).length === 0) {
        return hata(res, 400, 'Güncellenecek alan yok.')
      }
      await kol.updateOne({ _id: oid }, { $set: guncelle })
      const dok = await kol.findOne({ _id: oid })
      return res.status(200).json(mapId(dok))
    }

    // --- Sil (yalniz admin) ---
    if (req.method === 'DELETE') {
      if (s.rol !== 'admin') return hata(res, 403, 'Bu işlem için yetkiniz yok.')
      const id = tekParam(req.query.id)
      if (!id) return hata(res, 400, 'id parametresi gerekli.')
      const oid = toObjectId(id)
      if (!oid) return hata(res, 400, 'Geçersiz id.')
      await kol.deleteOne({ _id: oid })
      return res.status(200).json({ ok: true })
    }

    return hata(res, 405, 'Desteklenmeyen method.')
  } catch (e) {
    return hata(res, 500, 'Sunucu hatası: ' + (e as Error).message)
  }
}
