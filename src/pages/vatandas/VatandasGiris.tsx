import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Ikon } from '../../components/icons'

type Sekme = 'giris' | 'kayit'

export default function VatandasGiris() {
  const { vatandasGiris, vatandasKayit } = useAuth()
  const navigate = useNavigate()
  const [sekme, setSekme] = useState<Sekme>('giris')
  const [adSoyad, setAdSoyad] = useState('')
  const [kullaniciAdi, setKullaniciAdi] = useState('')
  const [telefon, setTelefon] = useState('')
  const [sifre, setSifre] = useState('')
  const [hata, setHata] = useState('')
  const [gonderiliyor, setGonderiliyor] = useState(false)

  async function gonder(e: React.FormEvent) {
    e.preventDefault()
    setHata('')
    setGonderiliyor(true)
    const sonuc =
      sekme === 'giris'
        ? await vatandasGiris(kullaniciAdi, sifre)
        : await vatandasKayit({ adSoyad, kullaniciAdi, telefon, sifre })
    setGonderiliyor(false)
    if (!sonuc.basarili) {
      setHata(sonuc.mesaj ?? 'İşlem başarısız oldu.')
      return
    }
    navigate('/vatandas', { replace: true })
  }

  function sekmeDegistir(s: Sekme) {
    setSekme(s)
    setHata('')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
            <Ikon.Kalp size={34} />
          </div>
          <h1 className="text-2xl font-bold text-white">LSMS Hasta Portalı</h1>
          <p className="mt-1 text-sm text-slate-400">Doktorlardan online randevu alın</p>
        </div>

        <div className="card">
          <div className="mb-5 flex rounded-lg bg-slate-800/60 p-1">
            <button
              type="button"
              onClick={() => sekmeDegistir('giris')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                sekme === 'giris' ? 'bg-emerald-600 text-white' : 'text-slate-300'
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => sekmeDegistir('kayit')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                sekme === 'kayit' ? 'bg-emerald-600 text-white' : 'text-slate-300'
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          <form onSubmit={gonder} className="space-y-4">
            {hata && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {hata}
              </div>
            )}

            {sekme === 'kayit' && (
              <div>
                <label className="label">Ad Soyad</label>
                <input
                  className="input"
                  value={adSoyad}
                  onChange={(e) => setAdSoyad(e.target.value)}
                  placeholder="Adınız Soyadınız"
                />
              </div>
            )}

            <div>
              <label className="label">Kullanıcı Adı</label>
              <input
                className="input"
                value={kullaniciAdi}
                onChange={(e) => setKullaniciAdi(e.target.value)}
                placeholder="kullanıcı adınız"
                autoComplete="username"
              />
            </div>

            {sekme === 'kayit' && (
              <div>
                <label className="label">Telefon</label>
                <input
                  className="input"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="555-0000"
                />
              </div>
            )}

            <div>
              <label className="label">Şifre</label>
              <input
                type="password"
                className="input"
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                placeholder="••••••••"
                autoComplete={sekme === 'giris' ? 'current-password' : 'new-password'}
              />
            </div>

            <button type="submit" className="btn-emerald w-full" disabled={gonderiliyor}>
              {gonderiliyor
                ? 'Lütfen bekleyin...'
                : sekme === 'giris'
                  ? 'Giriş Yap'
                  : 'Kayıt Ol'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
          <Link to="/giris" className="transition hover:text-emerald-300">
            Personel girişi →
          </Link>
        </div>
      </div>
    </div>
  )
}
