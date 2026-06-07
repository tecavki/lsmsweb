import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { VercelRequest } from '@vercel/node'
import type { WithId, Document } from 'mongodb'
import { getDb } from './mongodb'
import { toObjectId } from './util'

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

// Istek sahibini token'dan cozup dogru koleksiyondan dogrular. Gecersizse null.
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

// Yalniz personel/admin endpoint'leri icin: vatandas ise null doner.
export async function istekKullanicisi(
  req: VercelRequest,
): Promise<WithId<Document> | null> {
  const s = await istekSahibi(req)
  if (!s || s.rol === 'vatandas') return null
  return s.dok
}
