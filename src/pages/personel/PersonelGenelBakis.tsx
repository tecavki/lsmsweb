import { Link } from 'react-router-dom'
import { useDb } from '../../useDb'
import { store } from '../../store'
import { useAuth } from '../../context/AuthContext'
import { IstatistikKart } from '../../components/ui'
import { Ikon } from '../../components/icons'
import {
  oncelikEtiket,
  oncelikRenk,
  sureFormat,
  tarihFormat,
  vakaDurumEtiket,
  vakaDurumRenk,
} from '../../lib/format'

export default function PersonelGenelBakis() {
  const db = useDb()
  const { kullanici } = useAuth()
  if (!kullanici) return null

  const benimVakalar = db.vakalar.filter((v) => v.personelId === kullanici.id)
  const acikVakalar = benimVakalar.filter(
    (v) => v.durum === 'beklemede' || v.durum === 'mudahale',
  )
  const aktifMesai = store.aktifMesai(kullanici.id)
  const sonDuyuru = db.duyurular[0]

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Hoş geldin, {kullanici.adSoyad.split(' ')[0]}!</h2>
          <p className="text-sm text-slate-400">
            {kullanici.rutbe} · Sicil {kullanici.sicilNo}
          </p>
        </div>
        <div>
          {aktifMesai ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
              <div>
                <p className="text-sm font-semibold text-emerald-300">Görevdesiniz</p>
                <p className="text-xs text-emerald-400/80">{sureFormat(aktifMesai.baslangic, null)}</p>
              </div>
            </div>
          ) : (
            <Link to="/panel/mesai" className="btn-primary">
              <Ikon.Mesai size={18} /> Göreve Başla
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <IstatistikKart baslik="Toplam Vakam" deger={benimVakalar.length} ikon={<Ikon.Vaka />} />
        <IstatistikKart baslik="Açık Vakam" deger={acikVakalar.length} renk="text-amber-400" ikon={<Ikon.Kalp />} />
        <IstatistikKart
          baslik="Mesai Durumu"
          deger={aktifMesai ? 'Görevde' : 'Kapalı'}
          renk={aktifMesai ? 'text-emerald-400' : 'text-slate-400'}
          ikon={<Ikon.Saat />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Son Vakalarım</h2>
            <Link to="/panel/vakalar" className="text-sm text-sky-400 hover:text-sky-300">
              Tümünü gör
            </Link>
          </div>
          {benimVakalar.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Henüz vaka kaydınız yok.</p>
          ) : (
            <div className="space-y-2">
              {benimVakalar.slice(0, 5).map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {v.hastaAdi} <span className="text-slate-500">· {v.mudahaleTuru}</span>
                    </p>
                    <p className="text-xs text-slate-500">{tarihFormat(v.olusturmaTarihi)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <span className={`badge ${oncelikRenk[v.oncelik]}`}>{oncelikEtiket[v.oncelik]}</span>
                    <span className={`badge ${vakaDurumRenk[v.durum]}`}>{vakaDurumEtiket[v.durum]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 text-base font-semibold text-white">Son Duyuru</h2>
          {sonDuyuru ? (
            <div>
              {sonDuyuru.onemli && <span className="badge mb-2 bg-red-500/15 text-red-300">Önemli</span>}
              <p className="font-medium text-white">{sonDuyuru.baslik}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-400">{sonDuyuru.icerik}</p>
              <p className="mt-3 text-xs text-slate-500">{tarihFormat(sonDuyuru.tarih)}</p>
              <Link to="/panel/duyurular" className="mt-3 inline-block text-sm text-sky-400 hover:text-sky-300">
                Tüm duyurular
              </Link>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Duyuru yok.</p>
          )}
        </div>
      </div>
    </div>
  )
}
