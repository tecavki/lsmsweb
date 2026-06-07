import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import type { Rol } from './types'
import type { ReactNode } from 'react'

import Giris from './pages/Giris'
import AdminLayout from './pages/admin/AdminLayout'
import AdminGenelBakis from './pages/admin/AdminGenelBakis'
import Personeller from './pages/admin/Personeller'
import AdminVakalar from './pages/admin/AdminVakalar'
import AdminDuyurular from './pages/admin/AdminDuyurular'
import AdminMesai from './pages/admin/AdminMesai'

import PersonelLayout from './pages/personel/PersonelLayout'
import PersonelGenelBakis from './pages/personel/PersonelGenelBakis'
import PersonelMesai from './pages/personel/PersonelMesai'
import PersonelVakalar from './pages/personel/PersonelVakalar'
import PersonelDuyurular from './pages/personel/PersonelDuyurular'
import PersonelProfil from './pages/personel/PersonelProfil'

import Raporlar from './pages/Raporlar'
import RandevuYonetim from './pages/RandevuYonetim'

import VatandasGiris from './pages/vatandas/VatandasGiris'
import VatandasLayout from './pages/vatandas/VatandasLayout'
import VatandasGenelBakis from './pages/vatandas/VatandasGenelBakis'
import VatandasRandevular from './pages/vatandas/VatandasRandevular'

function YuklemeEkrani() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center text-slate-400">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-lsms-500" />
        <p className="text-sm">Yükleniyor...</p>
      </div>
    </div>
  )
}

function Korumali({ rol, children }: { rol: Rol; children: ReactNode }) {
  const { kullanici, vatandas, yukleniyor } = useAuth()
  if (yukleniyor) return <YuklemeEkrani />
  if (!kullanici) return <Navigate to={vatandas ? '/vatandas' : '/giris'} replace />
  if (kullanici.rol !== rol) {
    return <Navigate to={kullanici.rol === 'admin' ? '/admin' : '/panel'} replace />
  }
  return <>{children}</>
}

function VatandasKorumali({ children }: { children: ReactNode }) {
  const { vatandas, yukleniyor } = useAuth()
  if (yukleniyor) return <YuklemeEkrani />
  if (!vatandas) return <Navigate to="/vatandas/giris" replace />
  return <>{children}</>
}

function Yonlendir() {
  const { kullanici, vatandas, yukleniyor } = useAuth()
  if (yukleniyor) return <YuklemeEkrani />
  if (vatandas) return <Navigate to="/vatandas" replace />
  if (!kullanici) return <Navigate to="/giris" replace />
  return <Navigate to={kullanici.rol === 'admin' ? '/admin' : '/panel'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Yonlendir />} />
      <Route path="/giris" element={<Giris />} />
      <Route path="/vatandas/giris" element={<VatandasGiris />} />

      <Route
        path="/admin"
        element={
          <Korumali rol="admin">
            <AdminLayout />
          </Korumali>
        }
      >
        <Route index element={<AdminGenelBakis />} />
        <Route path="personel" element={<Personeller />} />
        <Route path="vakalar" element={<AdminVakalar />} />
        <Route path="duyurular" element={<AdminDuyurular />} />
        <Route path="mesai" element={<AdminMesai />} />
        <Route path="randevular" element={<RandevuYonetim yonetici />} />
        <Route
          path="raporlar"
          element={<Raporlar vurguRenk="bg-lsms-600 shadow-lsms-600/30" />}
        />
      </Route>

      <Route
        path="/panel"
        element={
          <Korumali rol="personel">
            <PersonelLayout />
          </Korumali>
        }
      >
        <Route index element={<PersonelGenelBakis />} />
        <Route path="mesai" element={<PersonelMesai />} />
        <Route path="vakalar" element={<PersonelVakalar />} />
        <Route path="duyurular" element={<PersonelDuyurular />} />
        <Route path="randevular" element={<RandevuYonetim />} />
        <Route
          path="raporlar"
          element={<Raporlar vurguRenk="bg-sky-600 shadow-sky-600/30" />}
        />
        <Route path="profil" element={<PersonelProfil />} />
      </Route>

      <Route
        path="/vatandas"
        element={
          <VatandasKorumali>
            <VatandasLayout />
          </VatandasKorumali>
        }
      >
        <Route index element={<VatandasGenelBakis />} />
        <Route path="randevular" element={<VatandasRandevular />} />
      </Route>

      <Route path="*" element={<Yonlendir />} />
    </Routes>
  )
}
