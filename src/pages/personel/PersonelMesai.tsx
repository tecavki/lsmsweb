import { useEffect, useState } from 'react'
import { useDb } from '../../useDb'
import { store } from '../../store'
import { useAuth } from '../../context/AuthContext'
import { BosDurum } from '../../components/ui'
import { sureFormat, tarihFormat } from '../../lib/format'

export default function PersonelMesai() {
  const db = useDb()
  const { kullanici } = useAuth()
  const [, setTik] = useState(0)

  // Aktif mesai süresini canlı güncelle
  useEffect(() => {
    const id = setInterval(() => setTik((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  if (!kullanici) return null

  const aktif = store.aktifMesai(kullanici.id)
  const benimMesailer = db.mesailer
    .filter((m) => m.personelId === kullanici.id)
    .sort((a, b) => new Date(b.baslangic).getTime() - new Date(a.baslangic).getTime())

  return (
    <div className="space-y-6">
      <div className="card flex flex-col items-center gap-5 py-10 text-center">
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full ${
            aktif ? 'bg-emerald-500/15' : 'bg-slate-800'
          }`}
        >
          <svg
            width="44" height="44" viewBox="0 0 24 24" fill="none"
            stroke={aktif ? '#34d399' : '#94a3b8'} strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
          </svg>
        </div>

        {aktif ? (
          <>
            <div>
              <p className="text-lg font-semibold text-emerald-300">Görevdesiniz</p>
              <p className="text-sm text-slate-400">
                Başlangıç: {tarihFormat(aktif.baslangic)} · Süre: {sureFormat(aktif.baslangic, null)}
              </p>
            </div>
            <button className="btn-danger" onClick={() => store.mesaiBitir(kullanici.id)}>
              Görevi Bitir
            </button>
          </>
        ) : (
          <>
            <div>
              <p className="text-lg font-semibold text-white">Mesai Kapalı</p>
              <p className="text-sm text-slate-400">Göreve başlamak için aşağıdaki butona basın.</p>
            </div>
            <button className="btn-primary" onClick={() => store.mesaiBaslat(kullanici)}>
              Göreve Başla
            </button>
          </>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-white">Mesai Geçmişim</h2>
        {benimMesailer.length === 0 ? (
          <BosDurum mesaj="Henüz mesai kaydınız yok." />
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="table-th">Başlangıç</th>
                  <th className="table-th">Bitiş</th>
                  <th className="table-th">Süre</th>
                  <th className="table-th">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {benimMesailer.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30">
                    <td className="table-td text-slate-300">{tarihFormat(m.baslangic)}</td>
                    <td className="table-td text-slate-300">{m.bitis ? tarihFormat(m.bitis) : '-'}</td>
                    <td className="table-td text-slate-300">{sureFormat(m.baslangic, m.bitis)}</td>
                    <td className="table-td">
                      {m.bitis === null ? (
                        <span className="badge bg-emerald-500/15 text-emerald-300">Görevde</span>
                      ) : (
                        <span className="badge bg-slate-500/15 text-slate-300">Tamamlandı</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
