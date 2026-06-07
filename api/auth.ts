import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  getDb,
  istekSahibi,
  sifreDogrula,
  sifreHashle,
  tokenUret,
  govdeOku,
  hata,
  personelDisa,
  tekParam,
  vatandasDisa,
  ensureSeed,
  toObjectId,
} from './shared'

function regexEscape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = tekParam(req.query.action)

  try {
    const db = await getDb()

    // --- Personel / Yonetici girisi ---
    if (req.method === 'POST' && action === 'login') {
      await ensureSeed(db)
      const { kullaniciAdi, sifre } = govdeOku(req)
      if (!kullaniciAdi || !sifre) {
        return hata(res, 400, 'Kullanıcı adı ve şifre gerekli.')
      }
      const dok = await db.collection('personeller').findOne({
        kullaniciAdi: { $regex: `^${regexEscape(String(kullaniciAdi).trim())}$`, $options: 'i' },
      })
      if (!dok) return hata(res, 401, 'Kullanıcı adı veya şifre hatalı.')
      if (dok.durum === 'pasif') return hata(res, 403, 'Hesabınız pasif durumda.')
      const eslesti = await sifreDogrula(String(sifre), dok.sifre)
      if (!eslesti) return hata(res, 401, 'Kullanıcı adı veya şifre hatalı.')
      const token = tokenUret({ id: dok._id.toString(), rol: dok.rol })
      return res.status(200).json({ token, tip: 'personel', kullanici: personelDisa(dok) })
    }

    // --- Vatandas kaydi ---
    if (req.method === 'POST' && action === 'vatandas-kayit') {
      const { adSoyad, kullaniciAdi, telefon, sifre } = govdeOku(req)
      if (!adSoyad || !kullaniciAdi || !sifre) {
        return hata(res, 400, 'Ad soyad, kullanıcı adı ve şifre zorunludur.')
      }
      const kullaniciAdiTrim = String(kullaniciAdi).trim()
      const vatandasKol = db.collection('vatandaslar')
      const mevcut = await vatandasKol.findOne({
        kullaniciAdi: { $regex: `^${regexEscape(kullaniciAdiTrim)}$`, $options: 'i' },
      })
      if (mevcut) return hata(res, 409, 'Bu kullanıcı adı zaten alınmış.')
      const yeni = {
        adSoyad: String(adSoyad).trim(),
        kullaniciAdi: kullaniciAdiTrim,
        telefon: String(telefon ?? '').trim(),
        sifre: await sifreHashle(String(sifre)),
        rol: 'vatandas' as const,
        kayitTarihi: new Date().toISOString(),
      }
      const r = await vatandasKol.insertOne(yeni)
      const dok = await vatandasKol.findOne({ _id: r.insertedId })
      const token = tokenUret({ id: r.insertedId.toString(), rol: 'vatandas' })
      return res.status(201).json({ token, tip: 'vatandas', kullanici: vatandasDisa(dok) })
    }

    // --- Vatandas girisi ---
    if (req.method === 'POST' && action === 'vatandas-giris') {
      await ensureSeed(db)
      const { kullaniciAdi, sifre } = govdeOku(req)
      if (!kullaniciAdi || !sifre) {
        return hata(res, 400, 'Kullanıcı adı ve şifre gerekli.')
      }
      const dok = await db.collection('vatandaslar').findOne({
        kullaniciAdi: { $regex: `^${regexEscape(String(kullaniciAdi).trim())}$`, $options: 'i' },
      })
      if (!dok) return hata(res, 401, 'Kullanıcı adı veya şifre hatalı.')
      const eslesti = await sifreDogrula(String(sifre), dok.sifre)
      if (!eslesti) return hata(res, 401, 'Kullanıcı adı veya şifre hatalı.')
      const token = tokenUret({ id: dok._id.toString(), rol: 'vatandas' })
      return res.status(200).json({ token, tip: 'vatandas', kullanici: vatandasDisa(dok) })
    }

    // --- Mevcut oturum sahibini dondur ---
    if (req.method === 'GET' && action === 'me') {
      const s = await istekSahibi(req)
      if (!s) return hata(res, 401, 'Oturum geçersiz.')
      if (s.rol === 'vatandas') {
        return res.status(200).json({ tip: 'vatandas', kullanici: vatandasDisa(s.dok) })
      }
      return res.status(200).json({ tip: 'personel', kullanici: personelDisa(s.dok) })
    }

    return hata(res, 404, 'Geçersiz istek.')
  } catch (e) {
    return hata(res, 500, 'Sunucu hatası: ' + (e as Error).message)
  }
}
