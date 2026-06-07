import { Link } from 'react-router-dom'
import { useDb } from '../../useDb'
import { store } from '../../store'
import { IstatistikKart } from '../../components/ui'
import { Ikon } from '../../components/icons'
import {
  oncelikEtiket,
  oncelikRenk,
  tarihFormat,
  vakaDurumEtiket,
  vakaDurumRenk,
} from '../../lib/format'

export default function AdminGenelBakis() {
  const db = useDb()

  const aktifPersonel = db.personeller.filter((p) => p.durum === 'aktif').length
  const acikVakalar = db.vakalar.filter(
    (v) => v.durum === 'beklemede' || v.durum === 'mudahale',
  ).length
  const gorevdekiler = db.mesailer.filter((m) => m.bitis === null)
  const sonVakalar = db.vakalar.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IstatistikKart
          baslik="Toplam Personel"
          deger={db.personeller.length}
          alt={`${aktifPersonel} aktif`}
          ikon={<Ikon.Personel />}
        />
        <IstatistikKart
          baslik="Açık Vakalar"
          deger={acikVakalar}
          alt={`${db.vakalar.length} toplam vaka`}
          renk="text-amber-400"
          ikon={<Ikon.Vaka />}
        />
        <IstatistikKart
          baslik="Görevdeki Personel"
          deger={gorevdekiler.length}
          alt="Şu an mesaide"
          renk="text-emerald-400"
          ikon={<Ikon.Mesai />}
        />
        <IstatistikKart
          baslik="Toplam Duyuru"
          deger={db.duyurular.length}
          alt="Yayında"
          renk="text-sky-400"
          ikon={<Ikon.Duyuru />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Son Vakalar</h2>
            <Link to="/admin/vakalar" className="text-sm text-lsms-400 hover:text-lsms-300">
              Tümünü gör
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="table-th">Vaka No</th>
                  <th className="table-th">Hasta</th>
                  <th className="table-th">Öncelik</th>
                  <th className="table-th">Durum</th>
                  <th className="table-th">Personel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {sonVakalar.map((v) => (
                  <tr key={v.id}>
                    <td className="table-td font-mono text-xs text-slate-400">{v.vakaNo}</td>
                    <td className="table-td font-medium">{v.hastaAdi}</td>
                    <td className="table-td">
                      <span className={`badge ${oncelikRenk[v.oncelik]}`}>
                        {oncelikEtiket[v.oncelik]}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={`badge ${vakaDurumRenk[v.durum]}`}>
                        {vakaDurumEtiket[v.durum]}
                      </span>
                    </td>
                    <td className="table-td text-slate-400">{v.personelAdi}</td>
                  </tr>
                ))}
                {sonVakalar.length === 0 && (
                  <tr>
                    <td colSpan={5} className="table-td text-center text-slate-500">
                      Henüz vaka kaydı yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-base font-semibold text-white">Görevdeki Personel</h2>
          <div className="space-y-3">
            {gorevdekiler.length === 0 && (
              <p className="text-sm text-slate-500">Şu an görevde personel yok.</p>
            )}
            {gorevdekiler.map((m) => {
              const p = store.personelGetir(m.personelId)
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{m.personelAdi}</p>
                    <p className="text-xs text-slate-500">{p?.rutbe ?? '-'}</p>
                  </div>
                  <span className="badge bg-emerald-500/15 text-emerald-300">Görevde</span>
                </div>
              )
            })}
          </div>

          <div className="mt-6 border-t border-slate-800 pt-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-300">Son Duyuru</h3>
            {db.duyurular[0] ? (
              <div className="rounded-lg bg-slate-800/50 p-3">
                <p className="text-sm font-medium text-white">{db.duyurular[0].baslik}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                  {db.duyurular[0].icerik}
                </p>
                <p className="mt-2 text-[11px] text-slate-500">
                  {tarihFormat(db.duyurular[0].tarih)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Duyuru yok.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
