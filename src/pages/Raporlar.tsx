import { Ikon } from '../components/icons'

const RAPOR_URL = 'https://lsms.rf.gd/'

export default function Raporlar({
  vurguRenk = 'bg-sky-600 shadow-sky-600/30',
}: {
  vurguRenk?: string
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card w-full max-w-lg text-center">
        <div
          className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg ${vurguRenk}`}
        >
          <Ikon.Rapor size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">LSMS Raporlar</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
          Rapor sistemine erişmek için aşağıdaki butona tıklayın. Rapor paneli yeni
          bir sekmede açılır.
        </p>

        <a
          href={RAPOR_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-primary mt-6 w-full"
        >
          <Ikon.DisLink size={18} /> Raporları Aç
        </a>

        <p className="mt-4 break-all text-xs text-slate-600">{RAPOR_URL}</p>
      </div>
    </div>
  )
}
