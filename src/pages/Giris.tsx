import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Giris() {
  const { girisYap } = useAuth()
  const navigate = useNavigate()
  const [kullaniciAdi, setKullaniciAdi] = useState('')
  const [sifre, setSifre] = useState('')
  const [hata, setHata] = useState('')
  const [gonderiliyor, setGonderiliyor] = useState(false)

  async function gonder(e: React.FormEvent) {
    e.preventDefault()
    setHata('')
    setGonderiliyor(true)
    const sonuc = await girisYap(kullaniciAdi, sifre)
    setGonderiliyor(false)
    if (!sonuc.basarili) {
      setHata(sonuc.mesaj ?? 'Giriş başarısız.')
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-lsms-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-lsms-600 shadow-lg shadow-lsms-600/30">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M11 2h2v7h7v2h-7v11h-2V11H4V9h7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">LSMS Yönetim Sistemi</h1>
          <p className="mt-1 text-sm text-slate-400">Los Santos Medikal Servisi</p>
        </div>

        <form onSubmit={gonder} className="card space-y-5">
          {hata && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {hata}
            </div>
          )}

          <div>
            <label className="label">Kullanıcı Adı</label>
            <input
              className="input"
              value={kullaniciAdi}
              onChange={(e) => setKullaniciAdi(e.target.value)}
              placeholder="kullanıcı adınız"
              autoFocus
            />
          </div>

          <div>
            <label className="label">Şifre</label>
            <input
              type="password"
              className="input"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={gonderiliyor}
          >
            {gonderiliyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400">
          <p className="mb-2 font-semibold text-slate-300">Demo Hesaplar</p>
          <div className="space-y-1">
            <p>
              <span className="text-slate-500">Yönetici:</span> admin / admin123
            </p>
            <p>
              <span className="text-slate-500">Personel:</span> ahmet / ahmet123
            </p>
            <p>
              <span className="text-slate-500">Personel:</span> elif / elif123
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
          <Link to="/vatandas/giris" className="transition hover:text-emerald-300">
            Vatandaş mısınız? Randevu için giriş yapın →
          </Link>
        </div>
      </div>
    </div>
  )
}
