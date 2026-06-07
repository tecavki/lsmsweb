import { useState } from 'react'
import { useDb } from '../../useDb'
import { store } from '../../store'
import { BosDurum, Modal } from '../../components/ui'
import { Ikon } from '../../components/icons'
import { randevuDurumEtiket, randevuDurumRenk } from '../../lib/format'

const bosForm = { doktorId: '', tarih: '', saat: '', sikayet: '' }

export default function VatandasRandevular() {
  const db = useDb()
  const [acik, setAcik] = useState(false)
  const [form, setForm] = useState(bosForm)
  const [hata, setHata] = useState('')
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [iptalId, setIptalId] = useState<string | null>(null)

  function formAc() {
    setForm(bosForm)
    setHata('')
    setAcik(true)
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault()
    setHata('')
    if (!form.doktorId || !form.tarih || !form.saat) {
      setHata('Doktor, tarih ve saat zorunludur.')
      return
    }
    setGonderiliyor(true)
    try {
      await store.randevuOlustur(form)
      setAcik(false)
      setForm(bosForm)
    } catch (err) {
      setHata((err as Error).message)
    } finally {
      setGonderiliyor(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Randevularım</h2>
          <p className="text-sm text-slate-400">
            Doktorlardan randevu alın ve durumunu takip edin.
          </p>
        </div>
        <button className="btn-emerald shrink-0" onClick={formAc}>
          <Ikon.Ekle size={18} /> Yeni Randevu
        </button>
      </div>

      {db.randevular.length === 0 ? (
        <BosDurum mesaj="Henüz randevunuz yok. 'Yeni Randevu' ile başlayın." />
      ) : (
        <div className="space-y-3">
          {db.randevular.map((r) => (
            <div key={r.id} className="card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">Dr. {r.doktorAdi}</h3>
                    <span className={`badge ${randevuDurumRenk[r.durum]}`}>
                      {randevuDurumEtiket[r.durum]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">
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
                </div>
                {(r.durum === 'beklemede' || r.durum === 'onaylandi') && (
                  <button
                    className="btn-secondary shrink-0"
                    onClick={() => setIptalId(r.id)}
                  >
                    İptal Et
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal acik={acik} baslik="Yeni Randevu" onKapat={() => setAcik(false)}>
        <form onSubmit={gonder} className="space-y-4">
          {hata && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {hata}
            </div>
          )}

          <div>
            <label className="label">Doktor</label>
            <select
              className="input"
              value={form.doktorId}
              onChange={(e) => setForm({ ...form, doktorId: e.target.value })}
            >
              <option value="">Doktor seçin</option>
              {db.doktorlar.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-800">
                  {d.adSoyad} — {d.rutbe}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tarih</label>
              <input
                type="date"
                className="input"
                value={form.tarih}
                onChange={(e) => setForm({ ...form, tarih: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Saat</label>
              <input
                type="time"
                className="input"
                value={form.saat}
                onChange={(e) => setForm({ ...form, saat: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Şikayet / Açıklama</label>
            <textarea
              className="input min-h-[90px]"
              value={form.sikayet}
              onChange={(e) => setForm({ ...form, sikayet: e.target.value })}
              placeholder="Şikayetinizi kısaca yazın..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setAcik(false)}>
              Vazgeç
            </button>
            <button type="submit" className="btn-emerald" disabled={gonderiliyor}>
              {gonderiliyor ? 'Gönderiliyor...' : 'Randevu Al'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        acik={iptalId !== null}
        baslik="Randevuyu İptal Et"
        onKapat={() => setIptalId(null)}
        genislik="max-w-md"
      >
        <p className="mb-6 text-sm text-slate-300">
          Bu randevuyu iptal etmek istediğinize emin misiniz?
        </p>
        <div className="flex justify-end gap-3">
          <button className="btn-secondary" onClick={() => setIptalId(null)}>
            Vazgeç
          </button>
          <button
            className="btn-danger"
            onClick={() => {
              if (iptalId) store.randevuIptal(iptalId)
              setIptalId(null)
            }}
          >
            Evet, İptal Et
          </button>
        </div>
      </Modal>
    </div>
  )
}
