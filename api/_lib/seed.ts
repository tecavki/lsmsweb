import type { Db } from 'mongodb'
import { sifreHashle } from './auth'

const simdi = () => new Date().toISOString()

// Tum demo verileri (idempotent) yukler.
export async function ensureSeed(db: Db): Promise<void> {
  await seedPersoneller(db)
  await seedVatandaslar(db)
}

// personeller koleksiyonu bossa demo personel/vaka/duyuru ekler.
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

// vatandaslar koleksiyonu bossa demo vatandas + ornek randevu ekler.
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

  // Ornek randevu icin aktif bir doktor bul
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
