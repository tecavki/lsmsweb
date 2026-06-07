import { useState } from 'react'
import { useDb } from '../../useDb'
import { store } from '../../store'
import { Modal, Onay, BosDurum } from '../../components/ui'
import { Ikon } from '../../components/icons'
import {
  basHarf,
  gunFormat,
  personelDurumEtiket,
  personelDurumRenk,
} from '../../lib/format'
import type { Personel, PersonelDurum, Rol } from '../../types'

interface Form {
  adSoyad: string
  kullaniciAdi: string
  sifre: string
  rol: Rol
  rutbe: string
  sicilNo: string
  telefon: string
  email: string
  durum: PersonelDurum
  goreveBaslamaTarihi: string
}

const bosForm: Form = {
  adSoyad: '',
  kullaniciAdi: '',
  sifre: '',
  rol: 'personel',
  rutbe: 'Stajyer',
  sicilNo: '',
  telefon: '',
  email: '',
  durum: 'aktif',
  goreveBaslamaTarihi: new Date().toISOString().slice(0, 10),
}

const rutbeler = [
  'Stajyer',
  'Paramedik',
  'Acil Tıp Teknisyeni',
  'Hemşire',
  'Doktor',
  'Uzman Doktor',
  'Başhekim Yardımcısı',
  'Başhekim',
]

export default function Personeller() {
  const db = useDb()
  const [modal, setModal] = useState(false)
  const [duzenleId, setDuzenleId] = useState<string | null>(null)
  const [form, setForm] = useState<Form>(bosForm)
  const [hata, setHata] = useState('')
  const [silId, setSilId] = useState<string | null>(null)
  const [arama, setArama] = useState('')

  const liste = db.personeller.filter(
    (p) =>
      p.adSoyad.toLowerCase().includes(arama.toLowerCase()) ||
      p.sicilNo.toLowerCase().includes(arama.toLowerCase()) ||
      p.kullaniciAdi.toLowerCase().includes(arama.toLowerCase()),
  )

  function yeniAc() {
    setForm(bosForm)
    setDuzenleId(null)
    setHata('')
    setModal(true)
  }

  function duzenleAc(p: Personel) {
    setForm({
      adSoyad: p.adSoyad,
      kullaniciAdi: p.kullaniciAdi,
      sifre: p.sifre,
      rol: p.rol,
      rutbe: p.rutbe,
      sicilNo: p.sicilNo,
      telefon: p.telefon,
      email: p.email,
      durum: p.durum,
      goreveBaslamaTarihi: p.goreveBaslamaTarihi,
    })
    setDuzenleId(p.id)
    setHata('')
    setModal(true)
  }

  function kaydet(e: React.FormEvent) {
    e.preventDefault()
    setHata('')
    if (!form.adSoyad.trim() || !form.kullaniciAdi.trim() || !form.sifre.trim()) {
      setHata('Ad soyad, kullanıcı adı ve şifre zorunludur.')
      return
    }
    const cakisma = db.personeller.find(
      (p) =>
        p.kullaniciAdi.toLowerCase() === form.kullaniciAdi.trim().toLowerCase() &&
        p.id !== duzenleId,
    )
    if (cakisma) {
      setHata('Bu kullanıcı adı zaten kullanılıyor.')
      return
    }

    if (duzenleId) {
      store.personelGuncelle(duzenleId, form)
    } else {
      store.personelEkle(form)
    }
    setModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            className="input pl-9"
            placeholder="Personel ara..."
            value={arama}
            onChange={(e) => setArama(e.target.value)}
          />
          <svg
            className="pointer-events-none absolute left-3 top-2.5 text-slate-500"
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <button className="btn-primary" onClick={yeniAc}>
          <Ikon.Ekle size={18} /> Yeni Personel
        </button>
      </div>

      {liste.length === 0 ? (
        <BosDurum mesaj="Personel bulunamadı." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="table-th">Personel</th>
                <th className="table-th">Sicil No</th>
                <th className="table-th">Rütbe</th>
                <th className="table-th">Rol</th>
                <th className="table-th">İletişim</th>
                <th className="table-th">Durum</th>
                <th className="table-th text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {liste.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
                        {basHarf(p.adSoyad)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{p.adSoyad}</p>
                        <p className="text-xs text-slate-500">@{p.kullaniciAdi}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td font-mono text-xs text-slate-400">{p.sicilNo || '-'}</td>
                  <td className="table-td">{p.rutbe}</td>
                  <td className="table-td">
                    <span
                      className={`badge ${
                        p.rol === 'admin'
                          ? 'bg-lsms-500/15 text-lsms-300'
                          : 'bg-slate-500/15 text-slate-300'
                      }`}
                    >
                      {p.rol === 'admin' ? 'Yönetici' : 'Personel'}
                    </span>
                  </td>
                  <td className="table-td text-xs text-slate-400">
                    <div>{p.telefon || '-'}</div>
                    <div className="text-slate-500">{p.email}</div>
                  </td>
                  <td className="table-td">
                    <span className={`badge ${personelDurumRenk[p.durum]}`}>
                      {personelDurumEtiket[p.durum]}
                    </span>
                  </td>
                  <td className="table-td">
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn-ghost px-2 py-1"
                        onClick={() => duzenleAc(p)}
                        title="Düzenle"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                        </svg>
                      </button>
                      <button
                        className="btn-ghost px-2 py-1 text-red-400 hover:bg-red-500/10"
                        onClick={() => setSilId(p.id)}
                        title="Sil"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        acik={modal}
        baslik={duzenleId ? 'Personel Düzenle' : 'Yeni Personel'}
        onKapat={() => setModal(false)}
        genislik="max-w-2xl"
      >
        <form onSubmit={kaydet} className="space-y-4">
          {hata && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {hata}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Ad Soyad</label>
              <input className="input" value={form.adSoyad} onChange={(e) => setForm({ ...form, adSoyad: e.target.value })} />
            </div>
            <div>
              <label className="label">Sicil No</label>
              <input className="input" value={form.sicilNo} onChange={(e) => setForm({ ...form, sicilNo: e.target.value })} placeholder="LSMS-000" />
            </div>
            <div>
              <label className="label">Kullanıcı Adı</label>
              <input className="input" value={form.kullaniciAdi} onChange={(e) => setForm({ ...form, kullaniciAdi: e.target.value })} />
            </div>
            <div>
              <label className="label">Şifre</label>
              <input className="input" value={form.sifre} onChange={(e) => setForm({ ...form, sifre: e.target.value })} />
            </div>
            <div>
              <label className="label">Rütbe</label>
              <select className="input" value={form.rutbe} onChange={(e) => setForm({ ...form, rutbe: e.target.value })}>
                {rutbeler.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Rol</label>
              <select className="input" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as Rol })}>
                <option value="personel">Personel</option>
                <option value="admin">Yönetici</option>
              </select>
            </div>
            <div>
              <label className="label">Telefon</label>
              <input className="input" value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
            </div>
            <div>
              <label className="label">E-posta</label>
              <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Durum</label>
              <select className="input" value={form.durum} onChange={(e) => setForm({ ...form, durum: e.target.value as PersonelDurum })}>
                <option value="aktif">Aktif</option>
                <option value="izinli">İzinli</option>
                <option value="pasif">Pasif</option>
              </select>
            </div>
            <div>
              <label className="label">Göreve Başlama</label>
              <input type="date" className="input" value={form.goreveBaslamaTarihi} onChange={(e) => setForm({ ...form, goreveBaslamaTarihi: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>
              İptal
            </button>
            <button type="submit" className="btn-primary">
              {duzenleId ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>

      <Onay
        acik={silId !== null}
        baslik="Personeli Sil"
        mesaj="Bu personeli silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        onIptal={() => setSilId(null)}
        onOnayla={() => {
          if (silId) store.personelSil(silId)
          setSilId(null)
        }}
      />

      <p className="text-xs text-slate-600">
        Toplam {db.personeller.length} personel · Son güncelleme {gunFormat(new Date().toISOString())}
      </p>
    </div>
  )
}
