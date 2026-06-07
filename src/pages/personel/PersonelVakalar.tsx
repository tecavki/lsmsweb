import { useState } from 'react'
import { useDb } from '../../useDb'
import { store } from '../../store'
import { useAuth } from '../../context/AuthContext'
import { Modal, Onay, BosDurum } from '../../components/ui'
import { Ikon } from '../../components/icons'
import {
  oncelikEtiket,
  oncelikRenk,
  tarihFormat,
  vakaDurumEtiket,
  vakaDurumRenk,
} from '../../lib/format'
import type { Vaka, VakaDurum, VakaOncelik } from '../../types'

interface Form {
  hastaAdi: string
  mudahaleTuru: string
  oncelik: VakaOncelik
  lokasyon: string
  aciklama: string
  durum: VakaDurum
}

const bosForm: Form = {
  hastaAdi: '',
  mudahaleTuru: '',
  oncelik: 'orta',
  lokasyon: '',
  aciklama: '',
  durum: 'beklemede',
}

const oncelikler: VakaOncelik[] = ['dusuk', 'orta', 'yuksek', 'kritik']
const durumlar: VakaDurum[] = ['beklemede', 'mudahale', 'tamamlandi', 'iptal']

export default function PersonelVakalar() {
  const db = useDb()
  const { kullanici } = useAuth()
  const [modal, setModal] = useState(false)
  const [duzenleId, setDuzenleId] = useState<string | null>(null)
  const [form, setForm] = useState<Form>(bosForm)
  const [hata, setHata] = useState('')
  const [silId, setSilId] = useState<string | null>(null)

  if (!kullanici) return null

  const benimVakalar = db.vakalar.filter((v) => v.personelId === kullanici.id)

  function yeniAc() {
    setForm(bosForm)
    setDuzenleId(null)
    setHata('')
    setModal(true)
  }

  function duzenleAc(v: Vaka) {
    setForm({
      hastaAdi: v.hastaAdi,
      mudahaleTuru: v.mudahaleTuru,
      oncelik: v.oncelik,
      lokasyon: v.lokasyon,
      aciklama: v.aciklama,
      durum: v.durum,
    })
    setDuzenleId(v.id)
    setHata('')
    setModal(true)
  }

  function kaydet(e: React.FormEvent) {
    e.preventDefault()
    if (!form.hastaAdi.trim() || !form.mudahaleTuru.trim()) {
      setHata('Hasta adı ve müdahale türü zorunludur.')
      return
    }
    if (duzenleId) {
      store.vakaGuncelle(duzenleId, form)
    } else {
      store.vakaEkle({
        ...form,
        personelId: kullanici!.id,
        personelAdi: kullanici!.adSoyad,
      })
    }
    setModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{benimVakalar.length} vaka kaydınız var</p>
        <button className="btn-primary" onClick={yeniAc}>
          <Ikon.Ekle size={18} /> Yeni Vaka
        </button>
      </div>

      {benimVakalar.length === 0 ? (
        <BosDurum mesaj="Henüz vaka kaydınız yok. Yeni vaka ekleyin." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {benimVakalar.map((v) => (
            <div key={v.id} className="card">
              <div className="mb-2 flex items-start justify-between">
                <span className="font-mono text-xs text-slate-500">{v.vakaNo}</span>
                <span className={`badge ${oncelikRenk[v.oncelik]}`}>{oncelikEtiket[v.oncelik]}</span>
              </div>
              <h3 className="font-semibold text-white">{v.hastaAdi}</h3>
              <p className="text-sm text-slate-400">{v.mudahaleTuru}</p>
              {v.lokasyon && (
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {v.lokasyon}
                </p>
              )}
              {v.aciklama && <p className="mt-2 line-clamp-2 text-sm text-slate-400">{v.aciklama}</p>}
              <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
                <span className={`badge ${vakaDurumRenk[v.durum]}`}>{vakaDurumEtiket[v.durum]}</span>
                <div className="flex gap-1">
                  <button className="btn-ghost px-2 py-1" onClick={() => duzenleAc(v)} title="Düzenle">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                    </svg>
                  </button>
                  <button className="btn-ghost px-2 py-1 text-red-400 hover:bg-red-500/10" onClick={() => setSilId(v.id)} title="Sil">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-600">{tarihFormat(v.olusturmaTarihi)}</p>
            </div>
          ))}
        </div>
      )}

      <Modal
        acik={modal}
        baslik={duzenleId ? 'Vaka Düzenle' : 'Yeni Vaka Kaydı'}
        onKapat={() => setModal(false)}
        genislik="max-w-xl"
      >
        <form onSubmit={kaydet} className="space-y-4">
          {hata && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {hata}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Hasta Adı</label>
              <input className="input" value={form.hastaAdi} onChange={(e) => setForm({ ...form, hastaAdi: e.target.value })} />
            </div>
            <div>
              <label className="label">Müdahale Türü</label>
              <input className="input" value={form.mudahaleTuru} onChange={(e) => setForm({ ...form, mudahaleTuru: e.target.value })} placeholder="Trafik Kazası, Kalp Krizi..." />
            </div>
            <div>
              <label className="label">Öncelik</label>
              <select className="input" value={form.oncelik} onChange={(e) => setForm({ ...form, oncelik: e.target.value as VakaOncelik })}>
                {oncelikler.map((o) => (
                  <option key={o} value={o}>{oncelikEtiket[o]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Durum</label>
              <select className="input" value={form.durum} onChange={(e) => setForm({ ...form, durum: e.target.value as VakaDurum })}>
                {durumlar.map((d) => (
                  <option key={d} value={d}>{vakaDurumEtiket[d]}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Lokasyon</label>
              <input className="input" value={form.lokasyon} onChange={(e) => setForm({ ...form, lokasyon: e.target.value })} placeholder="Vinewood Bulvarı..." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Açıklama</label>
              <textarea className="input min-h-[100px]" value={form.aciklama} onChange={(e) => setForm({ ...form, aciklama: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>İptal</button>
            <button type="submit" className="btn-primary">{duzenleId ? 'Güncelle' : 'Kaydet'}</button>
          </div>
        </form>
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
