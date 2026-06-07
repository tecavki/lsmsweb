import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { basHarf } from '../lib/format'

export interface NavOge {
  yol: string
  etiket: string
  ikon: ReactNode
  son?: boolean
}

export default function PanelLayout({
  baslik,
  rolEtiket,
  navOgeler,
  vurguRenk,
}: {
  baslik: string
  rolEtiket: string
  navOgeler: NavOge[]
  vurguRenk: string
}) {
  const { kullanici, cikisYap } = useAuth()
  const navigate = useNavigate()
  const [acik, setAcik] = useState(false)

  function cikis() {
    cikisYap()
    navigate('/giris', { replace: true })
  }

  if (!kullanici) return null

  const Kenar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${vurguRenk} shadow-lg`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M11 2h2v7h7v2h-7v11h-2V11H4V9h7z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-white">LSMS</p>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">{rolEtiket}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navOgeler.map((oge) => (
          <NavLink
            key={oge.yol}
            to={oge.yol}
            end={oge.son}
            onClick={() => setAcik(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`
            }
          >
            <span className="shrink-0">{oge.ikon}</span>
            {oge.etiket}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
            {basHarf(kullanici.adSoyad)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{kullanici.adSoyad}</p>
            <p className="truncate text-xs text-slate-500">{kullanici.rutbe}</p>
          </div>
        </div>
        <button onClick={cikis} className="btn-secondary w-full">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Çıkış Yap
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Masaüstü kenar çubuğu */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900/40 lg:block">
        {Kenar}
      </aside>

      {/* Mobil kenar çubuğu */}
      {acik && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setAcik(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-slate-800 bg-slate-900">
            {Kenar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAcik(true)}
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
              aria-label="Menü"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-white">{baslik}</h1>
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex">
            <span className={`badge ${vurguRenk} text-white`}>{rolEtiket}</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
