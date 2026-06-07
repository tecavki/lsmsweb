import { useEffect, useState } from 'react'
import { useDb } from '../../useDb'
import { store } from '../../store'
import { BosDurum } from '../../components/ui'
import { basHarf, sureFormat, tarihFormat } from '../../lib/format'

export default function AdminMesai() {
  const db = useDb()
  const [arama, setArama] = useState('')
  const [, setTik] = useState(0)

  // Aktif mesai sürelerini canlı güncelle
  useEffect(() => {
    const id = setInterval(() => setTik((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const mesailer = [...db.mesailer].sort(
    (a, b) => new Date(b.baslangic).getTime() - new Date(a.baslangic).getTime(),
  )
  const aktif = mesailer.filter((m) => m.bitis === null)

  const personeller = [...db.personeller]
    .filter(
      (p) =>
        p.adSoyad.toLowerCase().includes(arama.toLowerCase()) ||
        p.sicilNo.toLowerCase().includes(arama.toLowerCase()),
    )
    .sort((a, b) => {
      const aGorevde = store.aktifMesai(a.id) ? 0 : 1
      const bGorevde = store.aktifMesai(b.id) ? 0 : 1
      if (aGorevde !== bGorevde) return aGorevde - bGorevde
      return a.adSoyad.localeCompare(b.adSoyad, 'tr')
    })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs uppercase tracking-wide text-slate-400">Şu An Görevde</p>
          <p className="text-2xl font-bold text-emerald-400">{aktif.length}</p>
        </div>
        <div className="card">
          <p className="text-xs uppercase tracking-wide text-slate-400">Toplam Kayıt</p>
          <p className="text-2xl font-bold text-white">{mesailer.length}</p>
        </div>
        <div className="card">
          <p className="text-xs uppercase tracking-wide text-slate-400">Bugün Açılan</p>
          <p className="text-2xl font-bold text-sky-400">
            {
              mesailer.filter(
                (m) =>
                  new Date(m.baslangic).toDateString() === new Date().toDateString(),
              ).length
            }
          </p>
        </div>
      </div>

      {/* Personel mesai kontrolü */}
      <div className="card">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-white">Personel Mesai Kontrolü</h2>
          <input
            className="input w-full sm:max-w-xs"
            placeholder="Personel ara..."
            value={arama}
            onChange={(e) => setArama(e.target.value)}
          />
        </div>

        {personeller.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">Personel bulunamadı.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {personeller.map((p) => {
              const mesai = store.aktifMesai(p.id)
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                    mesai
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-slate-800 bg-slate-900/40'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
                      {basHarf(p.adSoyad)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{p.adSoyad}</p>
                      <p className="truncate text-xs text-slate-500">{p.rutbe}</p>
                      {mesai && (
                        <p className="mt-0.5 text-xs text-emerald-400">
                          Görevde · {sureFormat(mesai.baslangic, null)}
                        </p>
                      )}
                    </div>
                  </div>
                  {mesai ? (
                    <button
                      className="btn-danger shrink-0 px-3 py-1.5 text-xs"
                      onClick={() => store.mesaiBitir(p.id)}
                    >
                      Mesaiyi Kapat
                    </button>
                  ) : (
                    <button
                      className="btn-primary shrink-0 px-3 py-1.5 text-xs"
                      onClick={() => store.mesaiBaslat(p)}
                    >
                      Göreve Başlat
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {mesailer.length === 0 ? (
        <BosDurum mesaj="Henüz mesai kaydı yok." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="table-th">Personel</th>
                <th className="table-th">Başlangıç</th>
                <th className="table-th">Bitiş</th>
                <th className="table-th">Süre</th>
                <th className="table-th">Durum</th>
                <th className="table-th text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {mesailer.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30">
                  <td className="table-td font-medium">{m.personelAdi}</td>
                  <td className="table-td text-slate-300">{tarihFormat(m.baslangic)}</td>
                  <td className="table-td text-slate-300">
                    {m.bitis ? tarihFormat(m.bitis) : '-'}
                  </td>
                  <td className="table-td text-slate-300">{sureFormat(m.baslangic, m.bitis)}</td>
                  <td className="table-td">
                    {m.bitis === null ? (
                      <span className="badge bg-emerald-500/15 text-emerald-300">Görevde</span>
                    ) : (
                      <span className="badge bg-slate-500/15 text-slate-300">Tamamlandı</span>
                    )}
                  </td>
                  <td className="table-td text-right">
                    {m.bitis === null ? (
                      <button
                        className="btn-danger px-3 py-1 text-xs"
                        onClick={() => store.mesaiBitir(m.personelId)}
                      >
                        Kapat
                      </button>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
