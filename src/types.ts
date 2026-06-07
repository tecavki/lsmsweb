export type Rol = 'admin' | 'personel'

export type PersonelDurum = 'aktif' | 'izinli' | 'pasif'

export interface Personel {
  id: string
  adSoyad: string
  kullaniciAdi: string
  sifre: string
  rol: Rol
  rutbe: string
  sicilNo: string
  telefon: string
  email: string
  durum: PersonelDurum
  goreveBaslamaTarihi: string
  fotoUrl?: string
}

export type VakaDurum = 'beklemede' | 'mudahale' | 'tamamlandi' | 'iptal'
export type VakaOncelik = 'dusuk' | 'orta' | 'yuksek' | 'kritik'

export interface Vaka {
  id: string
  vakaNo: string
  hastaAdi: string
  mudahaleTuru: string
  oncelik: VakaOncelik
  lokasyon: string
  aciklama: string
  durum: VakaDurum
  personelId: string
  personelAdi: string
  olusturmaTarihi: string
  guncellemeTarihi: string
}

export interface Duyuru {
  id: string
  baslik: string
  icerik: string
  yazarId: string
  yazarAdi: string
  onemli: boolean
  tarih: string
}

export interface Mesai {
  id: string
  personelId: string
  personelAdi: string
  baslangic: string
  bitis: string | null
}

export interface Vatandas {
  id: string
  adSoyad: string
  kullaniciAdi: string
  telefon: string
  rol: 'vatandas'
  kayitTarihi: string
}

export interface Doktor {
  id: string
  adSoyad: string
  rutbe: string
}

export type RandevuDurum =
  | 'beklemede'
  | 'onaylandi'
  | 'reddedildi'
  | 'tamamlandi'
  | 'iptal'

export interface Randevu {
  id: string
  vatandasId: string
  vatandasAdi: string
  vatandasTelefon: string
  doktorId: string
  doktorAdi: string
  tarih: string
  saat: string
  sikayet: string
  durum: RandevuDurum
  doktorNotu: string
  olusturmaTarihi: string
}

export interface VeriTabani {
  personeller: Personel[]
  vakalar: Vaka[]
  duyurular: Duyuru[]
  mesailer: Mesai[]
  randevular: Randevu[]
  doktorlar: Doktor[]
}
