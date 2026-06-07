import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from './_lib/mongodb'
import { istekKullanicisi } from './_lib/auth'
import { govdeOku, hata, mapId, tekParam, toObjectId } from './_lib/util'

const simdi = () => new Date().toISOString()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const k = await istekKullanicisi(req)
    if (!k) return hata(res, 401, 'Oturum gerekli.')

    const db = await getDb()
    const kol = db.collection('mesailer')

    if (req.method === 'GET') {
      const liste = await kol.find().sort({ baslangic: -1 }).toArray()
      return res.status(200).json(liste.map(mapId))
    }

    if (req.method === 'POST') {
      const action = tekParam(req.query.action)
      const v = govdeOku(req)
      const personelId = String(v.personelId ?? '')
      if (!personelId) return hata(res, 400, 'personelId gerekli.')

      const yetkili = k.rol === 'admin' || k._id.toString() === personelId
      if (!yetkili) return hata(res, 403, 'Bu işlem için yetkiniz yok.')

      if (action === 'baslat') {
        const mevcut = await kol.findOne({ personelId, bitis: null })
        if (mevcut) return res.status(200).json(mapId(mevcut))

        const pOid = toObjectId(personelId)
        const personel = pOid
          ? await db.collection('personeller').findOne({ _id: pOid })
          : null
        const yeni = {
          personelId,
          personelAdi: personel?.adSoyad ?? v.personelAdi ?? '',
          baslangic: simdi(),
          bitis: null as string | null,
        }
        const r = await kol.insertOne(yeni)
        const dok = await kol.findOne({ _id: r.insertedId })
        return res.status(201).json(mapId(dok))
      }

      if (action === 'bitir') {
        await kol.updateOne({ personelId, bitis: null }, { $set: { bitis: simdi() } })
        return res.status(200).json({ ok: true })
      }

      return hata(res, 400, 'Geçersiz action (baslat|bitir).')
    }

    return hata(res, 405, 'Desteklenmeyen method.')
  } catch (e) {
    return hata(res, 500, 'Sunucu hatası: ' + (e as Error).message)
  }
}
