import PanelLayout from '../../components/PanelLayout'
import type { NavOge } from '../../components/PanelLayout'
import { Ikon } from '../../components/icons'

const navOgeler: NavOge[] = [
  { yol: '/panel', etiket: 'Genel Bakış', ikon: <Ikon.Pano />, son: true },
  { yol: '/panel/mesai', etiket: 'Mesai', ikon: <Ikon.Mesai /> },
  { yol: '/panel/vakalar', etiket: 'Vakalarım', ikon: <Ikon.Vaka /> },
  { yol: '/panel/duyurular', etiket: 'Duyurular', ikon: <Ikon.Duyuru /> },
  { yol: '/panel/randevular', etiket: 'Randevular', ikon: <Ikon.Randevu /> },
  { yol: '/panel/raporlar', etiket: 'Raporlar', ikon: <Ikon.Rapor /> },
  { yol: '/panel/profil', etiket: 'Profilim', ikon: <Ikon.Profil /> },
]

export default function PersonelLayout() {
  return (
    <PanelLayout
      baslik="Personel Paneli"
      rolEtiket="Personel"
      navOgeler={navOgeler}
      vurguRenk="bg-sky-600"
    />
  )
}
