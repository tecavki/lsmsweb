import { useState } from 'react'
import { useDb } from '../../useDb'
import { store } from '../../store'
import { useAuth } from '../../context/AuthContext'
import { Modal, Onay, BosDurum } from '../../components/ui'
import { Ikon } from '../../components/icons'
import { tarihFormat } from '../../lib/format'

export default function AdminDuyurular() {
  const db = useDb()
  const { kullanici } = useAuth()
  const [modal, setModal] = useState(false)
  const [baslik, setBaslik] = useState('')
  const [icerik, setIcerik] = useState('')
  const [onemli, setOnemli] = useState(false)
  const [hata, setHata] = useState('')
  const [silId, setSilId] = useState<string | null>(null)

  function kaydet(e: React.FormEvent) {
    e.preventDefault()
    if (!baslik.trim() || !icerik.trim()) {
      setHata('Başlık ve içerik zorunludur.')
      return
    }
    store.duyuruEkle({
      baslik: baslik.trim(),
      icerik: icerik.trim(),
      onemli,
      yazarId: kullanici!.id,
      yazarAdi: kullanici!.adSoyad,
    })
    setBaslik('')
    setIcerik('')
    setOnemli(false)
    setHata('')
    setModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{db.duyurular.length} duyuru yayında</p>
        <button className="btn-primary" onClick={() => setModal(true)}>
          <Ikon.Ekle size={18} /> Yeni Duyuru
        </button>
      </div>

      {db.duyurular.length === 0 ? (
        <BosDurum mesaj="Henüz duyuru yok." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {db.duyurular.map((d) => (
            <div key={d.id} className="card">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {d.onemli && (
                    <span className="badge bg-red-500/15 text-red-300">Önemli</span>
                  )}
                  <h3 className="font-semibold text-white">{d.baslik}</h3>
                </div>
                <button
                  className="btn-ghost px-2 py-1 text-red-400 hover:bg-red-500/10"
                  onClick={() => setSilId(d.id)}
                  title="Sil"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  </svg>
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-300">{d.icerik}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-500">
                <span>{d.yazarAdi}</span>
                <span>{tarihFormat(d.tarih)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal acik={modal} baslik="Yeni Duyuru" onKapat={() => setModal(false)}>
        <form onSubmit={kaydet} className="space-y-4">
          {hata && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {hata}
            </div>
          )}
          <div>
            <label className="label">Başlık</label>
            <input className="input" value={baslik} onChange={(e) => setBaslik(e.target.value)} />
          </div>
          <div>
            <label className="label">İçerik</label>
            <textarea className="input min-h-[120px]" value={icerik} onChange={(e) => setIcerik(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={onemli} onChange={(e) => setOnemli(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-lsms-600" />
            Önemli duyuru olarak işaretle
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>İptal</button>
            <button type="submit" className="btn-primary">Yayınla</button>
          </div>
        </form>
      </Modal>

      <Onay
        acik={silId !== null}
        baslik="Duyuruyu Sil"
        mesaj="Bu duyuruyu silmek istediğinize emin misiniz?"
        onIptal={() => setSilId(null)}
        onOnayla={() => {
          if (silId) store.duyuruSil(silId)
          setSilId(null)
        }}
      />
    </div>
  )
}
