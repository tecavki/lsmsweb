import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb, istekKullanicisi, govdeOku, hata, mapId, tekParam, toObjectId } from './shared'

const simdi = () => new Date().toISOString()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const k = await istekKullanicisi(req)
    if (!k) return hata(res, 401, 'Oturum gerekli.')

    const db = await getDb()
    const kol = db.collection('vakalar')

    if (req.method === 'GET') {
      const liste = await kol.find().sort({ olusturmaTarihi: -1 }).toArray()
      return res.status(200).json(liste.map(mapId))
    }

    if (req.method === 'POST') {
      const v = govdeOku(req)
      const sayi = await kol.countDocuments()
      const yeni = {
        hastaAdi: v.hastaAdi ?? '',
        mudahaleTuru: v.mudahaleTuru ?? '',
        oncelik: v.oncelik ?? 'orta',
        lokasyon: v.lokasyon ?? '',
        aciklama: v.aciklama ?? '',
        durum: v.durum ?? 'beklemede',
        personelId: v.personelId ?? '',
        personelAdi: v.personelAdi ?? '',
        vakaNo: 'VK-' + (1000 + sayi + 1),
        olusturmaTarihi: simdi(),
        guncellemeTarihi: simdi(),
      }
      const r = await kol.insertOne(yeni)
      const dok = await kol.findOne({ _id: r.insertedId })
      return res.status(201).json(mapId(dok))
    }

    const id = tekParam(req.query.id)
    if (!id) return hata(res, 400, 'id parametresi gerekli.')
    const oid = toObjectId(id)
    if (!oid) return hata(res, 400, 'Geçersiz id.')

    if (req.method === 'PATCH') {
      const v = govdeOku(req)
      const guncelle: any = { ...v, guncellemeTarihi: simdi() }
      delete guncelle.id
      delete guncelle._id
      delete guncelle.vakaNo
      delete guncelle.olusturmaTarihi
      await kol.updateOne({ _id: oid }, { $set: guncelle })
      const dok = await kol.findOne({ _id: oid })
      return res.status(200).json(mapId(dok))
    }

    if (req.method === 'DELETE') {
      await kol.deleteOne({ _id: oid })
      return res.status(200).json({ ok: true })
    }

    return hata(res, 405, 'Desteklenmeyen method.')
  } catch (e) {
    return hata(res, 500, 'Sunucu hatası: ' + (e as Error).message)
  }
}
