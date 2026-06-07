import { useState } from 'react'
import { useDb } from '../useDb'
import { store } from '../store'
import { BosDurum, Modal } from '../components/ui'
import { randevuDurumEtiket, randevuDurumRenk, tarihFormat } from '../lib/format'
import type { Randevu, RandevuDurum } from '../types'

const durumlar: RandevuDurum[] = [
  'beklemede',
  'onaylandi',
  'reddedildi',
  'tamamlandi',
  'iptal',
]

export default function RandevuYonetim({ yonetici = false }: { yonetici?: boolean }) {
  const db = useDb()
  const [filtre, setFiltre] = useState<'hepsi' | RandevuDurum>('hepsi')
  const [islem, setIslem] = useState<{ r: Randevu; durum: RandevuDurum } | null>(null)
  const [not, setNot] = useState('')

  const liste = db.randevular.filter((r) => filtre === 'hepsi' || r.durum === filtre)

  function hizliDurum(r: Randevu, durum: RandevuDurum) {
    store.randevuDurumGuncelle(r.id, durum)
  }

  function modalAc(r: Randevu, durum: RandevuDurum) {
    setIslem({ r, durum })
    setNot(r.doktorNotu ?? '')
  }

  function kaydet() {
    if (islem) store.randevuDurumGuncelle(islem.r.id, islem.durum, not)
    setIslem(null)
    setNot('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">
          {yonetici ? 'Tüm Randevular' : 'Randevularım'}
        </h2>
        <p className="text-sm text-slate-400">
          Vatandaşların randevu taleplerini görüntüleyin ve yönetin.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FiltreBtn aktif={filtre === 'hepsi'} onClick={() => setFiltre('hepsi')}>
          Hepsi ({db.randevular.length})
        </FiltreBtn>
        {durumlar.map((d) => (
          <FiltreBtn key={d} aktif={filtre === d} onClick={() => setFiltre(d)}>
            {randevuDurumEtiket[d]} ({db.randevular.filter((r) => r.durum === d).length})
          </FiltreBtn>
        ))}
      </div>

      {liste.length === 0 ? (
        <BosDurum mesaj="Bu filtreye uygun randevu bulunamadı." />
      ) : (
        <div className="space-y-3">
          {liste.map((r) => (
            <div key={r.id} className="card">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">{r.vatandasAdi}</h3>
                    <span className={`badge ${randevuDurumRenk[r.durum]}`}>
                      {randevuDurumEtiket[r.durum]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Tel: {r.vatandasTelefon || '-'} · Doktor: {r.doktorAdi}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-200">
                    {r.tarih} · {r.saat}
                  </p>
                  {r.sikayet && (
                    <p className="mt-2 rounded-lg bg-slate-800/50 p-3 text-sm text-slate-200">
                      {r.sikayet}
                    </p>
                  )}
                  {r.doktorNotu && (
                    <p className="mt-2 text-sm text-emerald-300">
                      <span className="text-slate-500">Doktor notu:</span> {r.doktorNotu}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-600">
                    Talep: {tarihFormat(r.olusturmaTarihi)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {r.durum === 'beklemede' && (
                    <>
                      <button
                        className="btn-primary"
                        onClick={() => hizliDurum(r, 'onaylandi')}
                      >
                        Onayla
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => hizliDurum(r, 'reddedildi')}
                      >
                        Reddet
                      </button>
                    </>
                  )}
                  {r.durum === 'onaylandi' && (
                    <button
                      className="btn-primary"
                      onClick={() => modalAc(r, 'tamamlandi')}
                    >
                      Tamamla
                    </button>
                  )}
                  <button className="btn-secondary" onClick={() => modalAc(r, r.durum)}>
                    Not
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        acik={islem !== null}
        baslik={islem?.durum === 'tamamlandi' ? 'Randevuyu Tamamla' : 'Doktor Notu'}
        onKapat={() => {
          setIslem(null)
          setNot('')
        }}
        genislik="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Doktor Notu</label>
            <textarea
              className="input min-h-[100px]"
              value={not}
              onChange={(e) => setNot(e.target.value)}
              placeholder="Hasta için not / değerlendirme..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              className="btn-secondary"
              onClick={() => {
                setIslem(null)
                setNot('')
              }}
            >
              Vazgeç
            </button>
            <button className="btn-primary" onClick={kaydet}>
              {islem?.durum === 'tamamlandi' ? 'Tamamla' : 'Kaydet'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function FiltreBtn({
  aktif,
  onClick,
  children,
}: {
  aktif: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
        aktif ? 'bg-lsms-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  )
}
