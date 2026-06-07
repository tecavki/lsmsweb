import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from './lib/mongodb'
import { istekKullanicisi, sifreHashle } from './lib/auth'
import { govdeOku, hata, personelDisa, tekParam, toObjectId } from './lib/util'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const k = await istekKullanicisi(req)
    if (!k) return hata(res, 401, 'Oturum gerekli.')

    const db = await getDb()
    const kol = db.collection('personeller')

    if (req.method === 'GET') {
      const liste = await kol.find().toArray()
      return res.status(200).json(liste.map(personelDisa))
    }

    if (req.method === 'POST') {
      if (k.rol !== 'admin') return hata(res, 403, 'Bu işlem için yetkiniz yok.')
      const v = govdeOku(req)
      if (!v.adSoyad || !v.kullaniciAdi || !v.sifre) {
        return hata(res, 400, 'Ad soyad, kullanıcı adı ve şifre zorunludur.')
      }
      const yeni = { ...v, sifre: await sifreHashle(String(v.sifre)) }
      delete yeni.id
      delete yeni._id
      const r = await kol.insertOne(yeni)
      const dok = await kol.findOne({ _id: r.insertedId })
      return res.status(201).json(personelDisa(dok))
    }

    const id = tekParam(req.query.id)
    if (!id) return hata(res, 400, 'id parametresi gerekli.')
    const oid = toObjectId(id)
    if (!oid) return hata(res, 400, 'Geçersiz id.')

    if (req.method === 'PATCH') {
      const kendi = k._id.toString() === id
      if (k.rol !== 'admin' && !kendi) return hata(res, 403, 'Bu işlem için yetkiniz yok.')
      const v = govdeOku(req)
      const guncelle: any = { ...v }
      delete guncelle.id
      delete guncelle._id
      if (guncelle.sifre) guncelle.sifre = await sifreHashle(String(guncelle.sifre))
      else delete guncelle.sifre
      await kol.updateOne({ _id: oid }, { $set: guncelle })
      const dok = await kol.findOne({ _id: oid })
      return res.status(200).json(personelDisa(dok))
    }

    if (req.method === 'DELETE') {
      if (k.rol !== 'admin') return hata(res, 403, 'Bu işlem için yetkiniz yok.')
      await kol.deleteOne({ _id: oid })
      return res.status(200).json({ ok: true })
    }

    return hata(res, 405, 'Desteklenmeyen method.')
  } catch (e) {
    return hata(res, 500, 'Sunucu hatası: ' + (e as Error).message)
  }
}
