import { useDb } from '../../useDb'
import { BosDurum } from '../../components/ui'
import { tarihFormat } from '../../lib/format'

export default function PersonelDuyurular() {
  const db = useDb()

  return (
    <div className="space-y-4">
      {db.duyurular.length === 0 ? (
        <BosDurum mesaj="Henüz duyuru yok." />
      ) : (
        db.duyurular.map((d) => (
          <div
            key={d.id}
            className={`card ${d.onemli ? 'border-l-4 border-l-red-500' : ''}`}
          >
            <div className="mb-1 flex items-center gap-2">
              {d.onemli && <span className="badge bg-red-500/15 text-red-300">Önemli</span>}
              <h3 className="font-semibold text-white">{d.baslik}</h3>
            </div>
            <p className="whitespace-pre-wrap text-sm text-slate-300">{d.icerik}</p>
            <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-500">
              <span>{d.yazarAdi}</span>
              <span>{tarihFormat(d.tarih)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
