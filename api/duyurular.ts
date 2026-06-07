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
    const kol = db.collection('duyurular')

    if (req.method === 'GET') {
      const liste = await kol.find().sort({ tarih: -1 }).toArray()
      return res.status(200).json(liste.map(mapId))
    }

    if (req.method === 'POST') {
      if (k.rol !== 'admin') return hata(res, 403, 'Bu işlem için yetkiniz yok.')
      const v = govdeOku(req)
      if (!v.baslik || !v.icerik) return hata(res, 400, 'Başlık ve içerik zorunludur.')
      const yeni = {
        baslik: v.baslik,
        icerik: v.icerik,
        yazarId: k._id.toString(),
        yazarAdi: k.adSoyad ?? '',
        onemli: Boolean(v.onemli),
        tarih: simdi(),
      }
      const r = await kol.insertOne(yeni)
      const dok = await kol.findOne({ _id: r.insertedId })
      return res.status(201).json(mapId(dok))
    }

    if (req.method === 'DELETE') {
      if (k.rol !== 'admin') return hata(res, 403, 'Bu işlem için yetkiniz yok.')
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
