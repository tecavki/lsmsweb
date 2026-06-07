import { Link } from 'react-router-dom'
import { useDb } from '../../useDb'
import { useAuth } from '../../context/AuthContext'
import { BosDurum, IstatistikKart } from '../../components/ui'
import { Ikon } from '../../components/icons'
import { randevuDurumEtiket, randevuDurumRenk } from '../../lib/format'

export default function VatandasGenelBakis() {
  const db = useDb()
  const { vatandas } = useAuth()

  const toplam = db.randevular.length
  const beklemede = db.randevular.filter((r) => r.durum === 'beklemede').length
  const onaylanan = db.randevular.filter((r) => r.durum === 'onaylandi').length
  const sonlar = db.randevular.slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-br from-emerald-600/20 to-slate-900/0">
        <h2 className="text-xl font-bold text-white">Merhaba, {vatandas?.adSoyad}</h2>
        <p className="mt-1 text-sm text-slate-300">
          LSMS hasta portalına hoş geldiniz. Doktorlarımızdan kolayca randevu alabilirsiniz.
        </p>
        <Link to="/vatandas/randevular" className="btn-emerald mt-4 w-fit">
          <Ikon.Ekle size={18} /> Yeni Randevu Al
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <IstatistikKart
          baslik="Toplam Randevu"
          deger={toplam}
          renk="text-emerald-400"
          ikon={<Ikon.Randevu />}
        />
        <IstatistikKart
          baslik="Beklemede"
          deger={beklemede}
          renk="text-amber-400"
          ikon={<Ikon.Saat />}
        />
        <IstatistikKart
          baslik="Onaylanan"
          deger={onaylanan}
          renk="text-sky-400"
          ikon={<Ikon.Onay />}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-300">Son Randevularım</h3>
        {sonlar.length === 0 ? (
          <BosDurum mesaj="Henüz randevunuz yok." />
        ) : (
          <div className="space-y-3">
            {sonlar.map((r) => (
              <div key={r.id} className="card flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-white">Dr. {r.doktorAdi}</p>
                  <p className="text-xs text-slate-400">
                    {r.tarih} · {r.saat}
                  </p>
                </div>
                <span className={`badge ${randevuDurumRenk[r.durum]}`}>
                  {randevuDurumEtiket[r.durum]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
