import { useState } from 'react'
import { useDb } from '../../useDb'
import { store } from '../../store'
import { Onay, BosDurum, Modal } from '../../components/ui'
import {
  oncelikEtiket,
  oncelikRenk,
  tarihFormat,
  vakaDurumEtiket,
  vakaDurumRenk,
} from '../../lib/format'
import type { Vaka, VakaDurum } from '../../types'

const durumlar: VakaDurum[] = ['beklemede', 'mudahale', 'tamamlandi', 'iptal']

export default function AdminVakalar() {
  const db = useDb()
  const [filtre, setFiltre] = useState<'hepsi' | VakaDurum>('hepsi')
  const [arama, setArama] = useState('')
  const [silId, setSilId] = useState<string | null>(null)
  const [detay, setDetay] = useState<Vaka | null>(null)

  const liste = db.vakalar.filter((v) => {
    const durumUygun = filtre === 'hepsi' || v.durum === filtre
    const aramaUygun =
      v.hastaAdi.toLowerCase().includes(arama.toLowerCase()) ||
      v.vakaNo.toLowerCase().includes(arama.toLowerCase()) ||
      v.mudahaleTuru.toLowerCase().includes(arama.toLowerCase())
    return durumUygun && aramaUygun
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <FiltreBtn aktif={filtre === 'hepsi'} onClick={() => setFiltre('hepsi')}>
            Hepsi ({db.vakalar.length})
          </FiltreBtn>
          {durumlar.map((d) => (
            <FiltreBtn key={d} aktif={filtre === d} onClick={() => setFiltre(d)}>
              {vakaDurumEtiket[d]} ({db.vakalar.filter((v) => v.durum === d).length})
            </FiltreBtn>
          ))}
        </div>
        <input
          className="input w-full lg:max-w-xs"
          placeholder="Vaka ara..."
          value={arama}
          onChange={(e) => setArama(e.target.value)}
        />
      </div>

      {liste.length === 0 ? (
        <BosDurum mesaj="Vaka bulunamadı." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="table-th">Vaka No</th>
                <th className="table-th">Hasta</th>
                <th className="table-th">Müdahale</th>
                <th className="table-th">Öncelik</th>
                <th className="table-th">Personel</th>
                <th className="table-th">Tarih</th>
                <th className="table-th">Durum</th>
                <th className="table-th text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {liste.map((v) => (
                <tr key={v.id} className="cursor-pointer hover:bg-slate-800/30" onClick={() => setDetay(v)}>
                  <td className="table-td font-mono text-xs text-slate-400">{v.vakaNo}</td>
                  <td className="table-td font-medium">{v.hastaAdi}</td>
                  <td className="table-td text-slate-300">{v.mudahaleTuru}</td>
                  <td className="table-td">
                    <span className={`badge ${oncelikRenk[v.oncelik]}`}>{oncelikEtiket[v.oncelik]}</span>
                  </td>
                  <td className="table-td text-slate-400">{v.personelAdi}</td>
                  <td className="table-td text-xs text-slate-500">{tarihFormat(v.olusturmaTarihi)}</td>
                  <td className="table-td" onClick={(e) => e.stopPropagation()}>
                    <select
                      className={`rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs ${vakaDurumRenk[v.durum]}`}
                      value={v.durum}
                      onChange={(e) => store.vakaGuncelle(v.id, { durum: e.target.value as VakaDurum })}
                    >
                      {durumlar.map((d) => (
                        <option key={d} value={d} className="bg-slate-800 text-slate-200">
                          {vakaDurumEtiket[d]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="table-td text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-ghost px-2 py-1 text-red-400 hover:bg-red-500/10"
                      onClick={() => setSilId(v.id)}
                      title="Sil"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal acik={detay !== null} baslik={`Vaka ${detay?.vakaNo ?? ''}`} onKapat={() => setDetay(null)}>
        {detay && (
          <div className="space-y-3 text-sm">
            <Satir etiket="Hasta" deger={detay.hastaAdi} />
            <Satir etiket="Müdahale Türü" deger={detay.mudahaleTuru} />
            <Satir etiket="Lokasyon" deger={detay.lokasyon} />
            <Satir etiket="Personel" deger={detay.personelAdi} />
            <div className="flex gap-4">
              <span className={`badge ${oncelikRenk[detay.oncelik]}`}>{oncelikEtiket[detay.oncelik]}</span>
              <span className={`badge ${vakaDurumRenk[detay.durum]}`}>{vakaDurumEtiket[detay.durum]}</span>
            </div>
            <div>
              <p className="label">Açıklama</p>
              <p className="rounded-lg bg-slate-800/50 p-3 text-slate-200">{detay.aciklama || '-'}</p>
            </div>
            <p className="text-xs text-slate-500">Oluşturma: {tarihFormat(detay.olusturmaTarihi)}</p>
          </div>
        )}
      </Modal>

      <Onay
        acik={silId !== null}
        baslik="Vakayı Sil"
        mesaj="Bu vaka kaydını silmek istediğinize emin misiniz?"
        onIptal={() => setSilId(null)}
        onOnayla={() => {
          if (silId) store.vakaSil(silId)
          setSilId(null)
        }}
      />
    </div>
  )
}

function FiltreBtn({ aktif, onClick, children }: { aktif: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        aktif ? 'bg-lsms-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  )
}

function Satir({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <div className="flex justify-between border-b border-slate-800 pb-2">
      <span className="text-slate-500">{etiket}</span>
      <span className="font-medium text-white">{deger}</span>
    </div>
  )
}
