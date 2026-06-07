import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from './_lib/mongodb'
import { istekSahibi } from './_lib/auth'
import { hata } from './_lib/util'

// Randevu alinabilecek aktif personel/doktor listesi (yalniz guvenli alanlar).
// Kimligi dogrulanmis her kullanici (personel veya vatandas) erisebilir.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const s = await istekSahibi(req)
    if (!s) return hata(res, 401, 'Oturum gerekli.')

    if (req.method === 'GET') {
      const db = await getDb()
      const liste = await db
        .collection('personeller')
        .find({ durum: 'aktif' })
        .toArray()
      const doktorlar = liste.map((p) => ({
        id: p._id.toString(),
        adSoyad: p.adSoyad,
        rutbe: p.rutbe,
      }))
      return res.status(200).json(doktorlar)
    }

    return hata(res, 405, 'Desteklenmeyen method.')
  } catch (e) {
    return hata(res, 500, 'Sunucu hatası: ' + (e as Error).message)
  }
}
