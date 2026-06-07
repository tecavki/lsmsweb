import type { Duyuru, Mesai, Personel, RandevuDurum, Vaka, VeriTabani } from './types'
import { api } from './api'

const YOLLAR: Record<keyof VeriTabani, string> = {
  personeller: '/api/personel',
  vakalar: '/api/vakalar',
  duyurular: '/api/duyurular',
  mesailer: '/api/mesai',
  randevular: '/api/randevular',
  doktorlar: '/api/doktorlar',
}

function bosDb(): VeriTabani {
  return {
    personeller: [],
    vakalar: [],
    duyurular: [],
    mesailer: [],
    randevular: [],
    doktorlar: [],
  }
}

let db: VeriTabani = bosDb()

const dinleyiciler = new Set<() => void>()

function bildir() {
  dinleyiciler.forEach((fn) => fn())
}

async function tazele(anahtar: keyof VeriTabani): Promise<void> {
  const veri = await api.get(YOLLAR[anahtar])
  db = { ...db, [anahtar]: veri }
  bildir()
}

export const store = {
  abone(fn: () => void) {
    dinleyiciler.add(fn)
    return () => {
      dinleyiciler.delete(fn)
    }
  },
  tum(): VeriTabani {
    return db
  },

  // Tum verileri sunucudan yukler (giris sonrasi / ilk acilis) - personel/admin
  async yukle(): Promise<void> {
    const [personeller, vakalar, duyurular, mesailer, randevular] = await Promise.all([
      api.get(YOLLAR.personeller),
      api.get(YOLLAR.vakalar),
      api.get(YOLLAR.duyurular),
      api.get(YOLLAR.mesailer),
      api.get(YOLLAR.randevular),
    ])
    db = { ...bosDb(), personeller, vakalar, duyurular, mesailer, randevular }
    bildir()
  },

  // Vatandas oturumu: yalniz doktor listesi + kendi randevulari
  async vatandasYukle(): Promise<void> {
    const [doktorlar, randevular] = await Promise.all([
      api.get(YOLLAR.doktorlar),
      api.get(YOLLAR.randevular),
    ])
    db = { ...bosDb(), doktorlar, randevular }
    bildir()
  },

  // Cikista yerel onbellegi temizler
  temizle(): void {
    db = bosDb()
    bildir()
  },

  personelGetir(id: string): Personel | undefined {
    return db.personeller.find((p) => p.id === id)
  },

  // --- Personel CRUD ---
  async personelEkle(veri: Omit<Personel, 'id'>): Promise<void> {
    await api.post(YOLLAR.personeller, veri)
    await tazele('personeller')
  },
  async personelGuncelle(id: string, veri: Partial<Personel>): Promise<void> {
    await api.patch(`${YOLLAR.personeller}?id=${id}`, veri)
    await tazele('personeller')
  },
  async personelSil(id: string): Promise<void> {
    await api.delete(`${YOLLAR.personeller}?id=${id}`)
    await tazele('personeller')
  },

  // --- Vaka CRUD ---
  async vakaEkle(
    veri: Omit<Vaka, 'id' | 'vakaNo' | 'olusturmaTarihi' | 'guncellemeTarihi'>,
  ): Promise<void> {
    await api.post(YOLLAR.vakalar, veri)
    await tazele('vakalar')
  },
  async vakaGuncelle(id: string, veri: Partial<Vaka>): Promise<void> {
    await api.patch(`${YOLLAR.vakalar}?id=${id}`, veri)
    await tazele('vakalar')
  },
  async vakaSil(id: string): Promise<void> {
    await api.delete(`${YOLLAR.vakalar}?id=${id}`)
    await tazele('vakalar')
  },

  // --- Duyuru CRUD ---
  async duyuruEkle(veri: Omit<Duyuru, 'id' | 'tarih'>): Promise<void> {
    await api.post(YOLLAR.duyurular, veri)
    await tazele('duyurular')
  },
  async duyuruSil(id: string): Promise<void> {
    await api.delete(`${YOLLAR.duyurular}?id=${id}`)
    await tazele('duyurular')
  },

  // --- Mesai ---
  aktifMesai(personelId: string): Mesai | undefined {
    return db.mesailer.find((m) => m.personelId === personelId && m.bitis === null)
  },
  async mesaiBaslat(personel: Personel): Promise<void> {
    await api.post(`${YOLLAR.mesailer}?action=baslat`, { personelId: personel.id })
    await tazele('mesailer')
  },
  async mesaiBitir(personelId: string): Promise<void> {
    await api.post(`${YOLLAR.mesailer}?action=bitir`, { personelId })
    await tazele('mesailer')
  },

  // --- Randevu ---
  async randevuOlustur(veri: {
    doktorId: string
    tarih: string
    saat: string
    sikayet: string
  }): Promise<void> {
    await api.post(YOLLAR.randevular, veri)
    await tazele('randevular')
  },
  async randevuDurumGuncelle(
    id: string,
    durum: RandevuDurum,
    doktorNotu?: string,
  ): Promise<void> {
    const govde: { durum: RandevuDurum; doktorNotu?: string } = { durum }
    if (doktorNotu !== undefined) govde.doktorNotu = doktorNotu
    await api.patch(`${YOLLAR.randevular}?id=${id}`, govde)
    await tazele('randevular')
  },
  async randevuIptal(id: string): Promise<void> {
    await api.patch(`${YOLLAR.randevular}?id=${id}`, { durum: 'iptal' })
    await tazele('randevular')
  },
}
