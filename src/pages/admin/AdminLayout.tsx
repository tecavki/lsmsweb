import PanelLayout from '../../components/PanelLayout'
import type { NavOge } from '../../components/PanelLayout'
import { Ikon } from '../../components/icons'

const navOgeler: NavOge[] = [
  { yol: '/admin', etiket: 'Genel Bakış', ikon: <Ikon.Pano />, son: true },
  { yol: '/admin/personel', etiket: 'Personel Yönetimi', ikon: <Ikon.Personel /> },
  { yol: '/admin/vakalar', etiket: 'Vaka Kayıtları', ikon: <Ikon.Vaka /> },
  { yol: '/admin/mesai', etiket: 'Mesai Takibi', ikon: <Ikon.Mesai /> },
  { yol: '/admin/duyurular', etiket: 'Duyurular', ikon: <Ikon.Duyuru /> },
  { yol: '/admin/randevular', etiket: 'Randevular', ikon: <Ikon.Randevu /> },
  { yol: '/admin/raporlar', etiket: 'Raporlar', ikon: <Ikon.Rapor /> },
]

export default function AdminLayout() {
  return (
    <PanelLayout
      baslik="Yönetici Paneli"
      rolEtiket="Yönetici"
      navOgeler={navOgeler}
      vurguRenk="bg-lsms-600"
    />
  )
}
