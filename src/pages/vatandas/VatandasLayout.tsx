import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Ikon } from '../../components/icons'
import { basHarf } from '../../lib/format'

const navOgeler = [
  { yol: '/vatandas', etiket: 'Genel Bakış', ikon: <Ikon.Pano />, son: true },
  { yol: '/vatandas/randevular', etiket: 'Randevularım', ikon: <Ikon.Randevu /> },
]

export default function VatandasLayout() {
  const { vatandas, cikisYap } = useAuth()
  const navigate = useNavigate()
  const [acik, setAcik] = useState(false)

  if (!vatandas) return null

  function cikis() {
    cikisYap()
    navigate('/vatandas/giris', { replace: true })
  }

  const yan = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <Ikon.Kalp size={22} />
        </div>
        <div>
          <p className="font-bold text-white">LSMS Hasta</p>
          <p className="text-xs text-slate-400">Randevu Portalı</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navOgeler.map((o) => (
          <NavLink
            key={o.yol}
            to={o.yol}
            end={o.son}
            onClick={() => setAcik(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            {o.ikon}
            {o.etiket}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600/20 text-sm font-semibold text-emerald-300">
            {basHarf(vatandas.adSoyad)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{vatandas.adSoyad}</p>
            <p className="truncate text-xs text-slate-400">Vatandaş</p>
          </div>
        </div>
        <button onClick={cikis} className="btn-secondary w-full">
          Çıkış Yap
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900/40 lg:block">
        {yan}
      </aside>

      {acik && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setAcik(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-slate-800 bg-slate-900">
            {yan}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/40 px-4 py-3 lg:px-8">
          <button
            className="btn-ghost p-2 lg:hidden"
            onClick={() => setAcik(true)}
            aria-label="Menü"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-white">Hasta Portalı</h1>
          <div className="w-8 lg:hidden" />
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
