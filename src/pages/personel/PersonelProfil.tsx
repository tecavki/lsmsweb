import { useState } from 'react'
import { store } from '../../store'
import { useAuth } from '../../context/AuthContext'
import { basHarf, gunFormat, personelDurumEtiket, personelDurumRenk } from '../../lib/format'

export default function PersonelProfil() {
  const { kullanici } = useAuth()
  const [eski, setEski] = useState('')
  const [yeni, setYeni] = useState('')
  const [yeniTekrar, setYeniTekrar] = useState('')
  const [mesaj, setMesaj] = useState<{ tip: 'ok' | 'err'; metin: string } | null>(null)

  const [telefon, setTelefon] = useState(kullanici?.telefon ?? '')
  const [email, setEmail] = useState(kullanici?.email ?? '')
  const [iletisimMesaj, setIletisimMesaj] = useState('')

  if (!kullanici) return null

  function sifreDegistir(e: React.FormEvent) {
    e.preventDefault()
    setMesaj(null)
    if (eski !== kullanici!.sifre) {
      setMesaj({ tip: 'err', metin: 'Mevcut şifreniz hatalı.' })
      return
    }
    if (yeni.length < 4) {
      setMesaj({ tip: 'err', metin: 'Yeni şifre en az 4 karakter olmalı.' })
      return
    }
    if (yeni !== yeniTekrar) {
      setMesaj({ tip: 'err', metin: 'Yeni şifreler eşleşmiyor.' })
      return
    }
    store.personelGuncelle(kullanici!.id, { sifre: yeni })
    setEski('')
    setYeni('')
    setYeniTekrar('')
    setMesaj({ tip: 'ok', metin: 'Şifreniz başarıyla güncellendi.' })
  }

  function iletisimKaydet(e: React.FormEvent) {
    e.preventDefault()
    store.personelGuncelle(kullanici!.id, { telefon, email })
    setIletisimMesaj('İletişim bilgileriniz güncellendi.')
    setTimeout(() => setIletisimMesaj(''), 3000)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="card lg:col-span-1">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-600 text-2xl font-bold text-white">
            {basHarf(kullanici.adSoyad)}
          </div>
          <h2 className="mt-3 text-lg font-semibold text-white">{kullanici.adSoyad}</h2>
          <p className="text-sm text-slate-400">{kullanici.rutbe}</p>
          <span className={`badge mt-2 ${personelDurumRenk[kullanici.durum]}`}>
            {personelDurumEtiket[kullanici.durum]}
          </span>
        </div>
        <div className="mt-6 space-y-3 border-t border-slate-800 pt-4 text-sm">
          <Satir etiket="Sicil No" deger={kullanici.sicilNo} />
          <Satir etiket="Kullanıcı Adı" deger={'@' + kullanici.kullaniciAdi} />
          <Satir etiket="Göreve Başlama" deger={gunFormat(kullanici.goreveBaslamaTarihi)} />
          <Satir etiket="Rol" deger={kullanici.rol === 'admin' ? 'Yönetici' : 'Personel'} />
        </div>
      </div>

      <div className="space-y-6 lg:col-span-2">
        <div className="card">
          <h3 className="mb-4 text-base font-semibold text-white">İletişim Bilgileri</h3>
          {iletisimMesaj && (
            <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              {iletisimMesaj}
            </div>
          )}
          <form onSubmit={iletisimKaydet} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Telefon</label>
              <input className="input" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
            </div>
            <div>
              <label className="label">E-posta</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">Kaydet</button>
            </div>
          </form>
        </div>

        <div className="card">
          <h3 className="mb-4 text-base font-semibold text-white">Şifre Değiştir</h3>
          {mesaj && (
            <div
              className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
                mesaj.tip === 'ok'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-red-500/30 bg-red-500/10 text-red-300'
              }`}
            >
              {mesaj.metin}
            </div>
          )}
          <form onSubmit={sifreDegistir} className="space-y-4">
            <div>
              <label className="label">Mevcut Şifre</label>
              <input type="password" className="input" value={eski} onChange={(e) => setEski(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Yeni Şifre</label>
                <input type="password" className="input" value={yeni} onChange={(e) => setYeni(e.target.value)} />
              </div>
              <div>
                <label className="label">Yeni Şifre (Tekrar)</label>
                <input type="password" className="input" value={yeniTekrar} onChange={(e) => setYeniTekrar(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-primary">Şifreyi Güncelle</button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Satir({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{etiket}</span>
      <span className="font-medium text-slate-200">{deger}</span>
    </div>
  )
}
