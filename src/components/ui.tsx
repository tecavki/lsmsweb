import type { ReactNode } from 'react'

export function Modal({
  acik,
  baslik,
  onKapat,
  children,
  genislik = 'max-w-lg',
}: {
  acik: boolean
  baslik: string
  onKapat: () => void
  children: ReactNode
  genislik?: string
}) {
  if (!acik) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onKapat}
      />
      <div
        className={`relative w-full ${genislik} max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{baslik}</h3>
          <button
            onClick={onKapat}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Kapat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Onay({
  acik,
  baslik,
  mesaj,
  onIptal,
  onOnayla,
}: {
  acik: boolean
  baslik: string
  mesaj: string
  onIptal: () => void
  onOnayla: () => void
}) {
  return (
    <Modal acik={acik} baslik={baslik} onKapat={onIptal} genislik="max-w-md">
      <p className="mb-6 text-sm text-slate-300">{mesaj}</p>
      <div className="flex justify-end gap-3">
        <button className="btn-secondary" onClick={onIptal}>
          Vazgeç
        </button>
        <button className="btn-danger" onClick={onOnayla}>
          Evet, Sil
        </button>
      </div>
    </Modal>
  )
}

export function IstatistikKart({
  baslik,
  deger,
  alt,
  renk = 'text-lsms-400',
  ikon,
}: {
  baslik: string
  deger: ReactNode
  alt?: string
  renk?: string
  ikon?: ReactNode
}) {
  return (
    <div className="card flex items-center gap-4">
      {ikon && (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
          {ikon}
        </div>
      )}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{baslik}</p>
        <p className={`text-2xl font-bold ${renk}`}>{deger}</p>
        {alt && <p className="text-xs text-slate-500">{alt}</p>}
      </div>
    </div>
  )
}

export function BosDurum({ mesaj }: { mesaj: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-12 text-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-slate-600">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
      <p className="text-sm text-slate-500">{mesaj}</p>
    </div>
  )
}
