import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MongoClient, ObjectId, type Db, type WithId, type Document } from 'mongodb'

/* ---------- mongodb ---------- */

const uri = process.env.MONGODB_URI
const dbAdi = process.env.MONGODB_DB || 'lsms'

declare global {
  var _lsmsMongoClient: Promise<MongoClient> | undefined
}

function clientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('MONGODB_URI ortam degiskeni tanimli degil.')
  }
  if (!globalThis._lsmsMongoClient) {
    globalThis._lsmsMongoClient = new MongoClient(uri).connect()
  }
  return globalThis._lsmsMongoClient
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise()
  return client.db(dbAdi)
}

/* ---------- util ---------- */

export function mapId(dok: any): any {
  if (!dok) return dok
  const { _id, ...rest } = dok
  return { ...rest, id: _id?.toString() }
}

export function personelDisa(dok: any): any {
  const m = mapId(dok)
  if (m && 'sifre' in m) delete m.sifre
  return m
}

export function vatandasDisa(dok: any): any {
  const m = mapId(dok)
  if (m && 'sifre' in m) delete m.sifre
  return m
}

export function toObjectId(id: string): ObjectId | null {
  try {
    return new ObjectId(id)
  } catch {
    return null
  }
}

export function govdeOku(req: VercelRequest): any {
  const b = req.body
  if (b && typeof b === 'object') return b
  if (typeof b === 'string') {
    try {
      return JSON.parse(b)
    } catch {
      return {}
    }
  }
  return {}
}

export function tekParam(deger: string | string[] | undefined): string | undefined {
  if (Array.isArray(deger)) return deger[0]
  return deger
}

export function hata(res: VercelResponse, kod: number, mesaj: string) {
  return res.status(kod).json({ hata: mesaj })
}

/* ---------- auth ---------- */

const JWT_SECRET = process.env.JWT_SECRET || 'gelistirme-icin-gecici-gizli-anahtar'

export type Rol = 'admin' | 'personel' | 'vatandas'

export interface TokenIcerik {
  id: string
  rol: Rol
}

export interface IstekSahibi {
  rol: Rol
  id: string
  dok: WithId<Document>
}

export async function sifreHashle(sifre: string): Promise<string> {
  return bcrypt.hash(sifre, 10)
}

export async function sifreDogrula(sifre: string, hash: string): Promise<boolean> {
  return bcrypt.compare(sifre, hash)
}

export function tokenUret(icerik: TokenIcerik): string {
  return jwt.sign(icerik, JWT_SECRET, { expiresIn: '7d' })
}

export function tokenCoz(token: string): TokenIcerik | null {
  try {
    const c = jwt.verify(token, JWT_SECRET)
    if (typeof c === 'object' && c && 'id' in c && 'rol' in c) {
      return { id: String((c as any).id), rol: (c as any).rol }
    }
    return null
  } catch {
    return null
  }
}

function tokenAl(req: VercelRequest): string | null {
  const h = req.headers.authorization
  if (h && h.startsWith('Bearer ')) return h.slice(7)
  return null
}

export async function istekSahibi(req: VercelRequest): Promise<IstekSahibi | null> {
  const token = tokenAl(req)
  if (!token) return null
  const icerik = tokenCoz(token)
  if (!icerik) return null
  const oid = toObjectId(icerik.id)
  if (!oid) return null
  const db = await getDb()
  const kolAdi = icerik.rol === 'vatandas' ? 'vatandaslar' : 'personeller'
  const dok = await db.collection(kolAdi).findOne({ _id: oid })
  if (!dok) return null
  return { rol: icerik.rol, id: oid.toString(), dok }
}

export async function istekKullanicisi(
  req: VercelRequest,
): Promise<WithId<Document> | null> {
  const s = await istekSahibi(req)
  if (!s || s.rol === 'vatandas') return null
  return s.dok
}

/* ---------- seed ---------- */

const simdi = () => new Date().toISOString()

export async function ensureSeed(db: Db): Promise<void> {
  await seedPersoneller(db)
  await seedVatandaslar(db)
}

async function seedPersoneller(db: Db): Promise<void> {
  const personelKol = db.collection('personeller')
  const sayi = await personelKol.countDocuments()
  if (sayi > 0) return

  const adminRes = await personelKol.insertOne({
    adSoyad: 'Sistem Yöneticisi',
    kullaniciAdi: 'admin',
    sifre: await sifreHashle('admin123'),
    rol: 'admin',
    rutbe: 'Başhekim',
    sicilNo: 'LSMS-001',
    telefon: '555-0001',
    email: 'admin@lsms.gov',
    durum: 'aktif',
    goreveBaslamaTarihi: '2024-01-01',
  })

  const p1Res = await personelKol.insertOne({
    adSoyad: 'Ahmet Yılmaz',
    kullaniciAdi: 'ahmet',
    sifre: await sifreHashle('ahmet123'),
    rol: 'personel',
    rutbe: 'Doktor',
    sicilNo: 'LSMS-014',
    telefon: '555-0142',
    email: 'ahmet@lsms.gov',
    durum: 'aktif',
    goreveBaslamaTarihi: '2024-03-12',
  })

  const p2Res = await personelKol.insertOne({
    adSoyad: 'Elif Demir',
    kullaniciAdi: 'elif',
    sifre: await sifreHashle('elif123'),
    rol: 'personel',
    rutbe: 'Paramedik',
    sicilNo: 'LSMS-027',
    telefon: '555-0271',
    email: 'elif@lsms.gov',
    durum: 'aktif',
    goreveBaslamaTarihi: '2024-05-20',
  })

  const adminId = adminRes.insertedId.toString()
  const p1Id = p1Res.insertedId.toString()
  const p2Id = p2Res.insertedId.toString()

  await db.collection('vakalar').insertMany([
    {
      vakaNo: 'VK-1001',
      hastaAdi: 'John Doe',
      mudahaleTuru: 'Trafik Kazası',
      oncelik: 'yuksek',
      lokasyon: 'Vinewood Bulvarı',
      aciklama: 'Çoklu yaralanma, olay yerinde müdahale edildi.',
      durum: 'tamamlandi',
      personelId: p1Id,
      personelAdi: 'Ahmet Yılmaz',
      olusturmaTarihi: simdi(),
      guncellemeTarihi: simdi(),
    },
    {
      vakaNo: 'VK-1002',
      hastaAdi: 'Jane Smith',
      mudahaleTuru: 'Kalp Krizi',
      oncelik: 'kritik',
      lokasyon: 'Mirror Park',
      aciklama: 'Acil sevk gerekiyor.',
      durum: 'mudahale',
      personelId: p2Id,
      personelAdi: 'Elif Demir',
      olusturmaTarihi: simdi(),
      guncellemeTarihi: simdi(),
    },
  ])

  await db.collection('duyurular').insertOne({
    baslik: 'LSMS Yönetim Sistemine Hoş Geldiniz',
    icerik:
      'Tüm personelin görev başlangıcında mesai kaydı açması zorunludur. Vaka kayıtlarını eksiksiz doldurunuz.',
    yazarId: adminId,
    yazarAdi: 'Sistem Yöneticisi',
    onemli: true,
    tarih: simdi(),
  })
}

async function seedVatandaslar(db: Db): Promise<void> {
  const vatandasKol = db.collection('vatandaslar')
  const sayi = await vatandasKol.countDocuments()
  if (sayi > 0) return

  const vRes = await vatandasKol.insertOne({
    adSoyad: 'Mehmet Kaya',
    kullaniciAdi: 'vatandas',
    sifre: await sifreHashle('vatandas123'),
    telefon: '555-0420',
    rol: 'vatandas',
    kayitTarihi: simdi(),
  })

  const doktor = await db
    .collection('personeller')
    .findOne({ rol: 'personel', durum: 'aktif' })
  if (doktor) {
    const yarin = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
    await db.collection('randevular').insertOne({
      vatandasId: vRes.insertedId.toString(),
      vatandasAdi: 'Mehmet Kaya',
      vatandasTelefon: '555-0420',
      doktorId: doktor._id.toString(),
      doktorAdi: doktor.adSoyad,
      tarih: yarin,
      saat: '10:30',
      sikayet: 'Genel kontrol ve tansiyon ölçümü.',
      durum: 'beklemede',
      doktorNotu: '',
      olusturmaTarihi: simdi(),
    })
  }
}
