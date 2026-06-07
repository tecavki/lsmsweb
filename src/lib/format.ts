import type { PersonelDurum, RandevuDurum, VakaDurum, VakaOncelik } from '../types'

export function tarihFormat(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function gunFormat(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function sureFormat(baslangic: string, bitis: string | null): string {
  const son = bitis ? new Date(bitis).getTime() : Date.now()
  const fark = Math.max(0, son - new Date(baslangic).getTime())
  const saat = Math.floor(fark / 3_600_000)
  const dakika = Math.floor((fark % 3_600_000) / 60_000)
  return `${saat}s ${dakika}dk`
}

export const vakaDurumEtiket: Record<VakaDurum, string> = {
  beklemede: 'Beklemede',
  mudahale: 'Müdahalede',
  tamamlandi: 'Tamamlandı',
  iptal: 'İptal',
}

export const vakaDurumRenk: Record<VakaDurum, string> = {
  beklemede: 'bg-amber-500/15 text-amber-300',
  mudahale: 'bg-sky-500/15 text-sky-300',
  tamamlandi: 'bg-emerald-500/15 text-emerald-300',
  iptal: 'bg-slate-500/15 text-slate-300',
}

export const oncelikEtiket: Record<VakaOncelik, string> = {
  dusuk: 'Düşük',
  orta: 'Orta',
  yuksek: 'Yüksek',
  kritik: 'Kritik',
}

export const oncelikRenk: Record<VakaOncelik, string> = {
  dusuk: 'bg-slate-500/15 text-slate-300',
  orta: 'bg-sky-500/15 text-sky-300',
  yuksek: 'bg-orange-500/15 text-orange-300',
  kritik: 'bg-red-500/15 text-red-300',
}

export const personelDurumEtiket: Record<PersonelDurum, string> = {
  aktif: 'Aktif',
  izinli: 'İzinli',
  pasif: 'Pasif',
}

export const personelDurumRenk: Record<PersonelDurum, string> = {
  aktif: 'bg-emerald-500/15 text-emerald-300',
  izinli: 'bg-amber-500/15 text-amber-300',
  pasif: 'bg-slate-500/15 text-slate-300',
}

export const randevuDurumEtiket: Record<RandevuDurum, string> = {
  beklemede: 'Beklemede',
  onaylandi: 'Onaylandı',
  reddedildi: 'Reddedildi',
  tamamlandi: 'Tamamlandı',
  iptal: 'İptal',
}

export const randevuDurumRenk: Record<RandevuDurum, string> = {
  beklemede: 'bg-amber-500/15 text-amber-300',
  onaylandi: 'bg-sky-500/15 text-sky-300',
  reddedildi: 'bg-red-500/15 text-red-300',
  tamamlandi: 'bg-emerald-500/15 text-emerald-300',
  iptal: 'bg-slate-500/15 text-slate-300',
}

export function basHarf(ad: string): string {
  return ad
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}
