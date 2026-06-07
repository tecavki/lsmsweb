import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ObjectId } from 'mongodb'

// MongoDB dokumanini ( _id ) frontend'in bekledigi ( id: string ) sekle cevirir
export function mapId(dok: any): any {
  if (!dok) return dok
  const { _id, ...rest } = dok
  return { ...rest, id: _id?.toString() }
}

// Personeli disariya verirken sifre alanini her zaman cikar
export function personelDisa(dok: any): any {
  const m = mapId(dok)
  if (m && 'sifre' in m) delete m.sifre
  return m
}

// Vatandasi disariya verirken sifre alanini her zaman cikar
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

// @vercel/node govdeyi cogunlukla parse eder; yine de guvenli bir okuma sagla
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
