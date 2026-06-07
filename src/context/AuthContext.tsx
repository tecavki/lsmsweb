import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { store } from '../store'
import { api, tokenAl, tokenKaydet, tokenSil } from '../api'
import type { Personel, Vatandas } from '../types'

interface Sonuc {
  basarili: boolean
  mesaj?: string
}

export interface VatandasKayitForm {
  adSoyad: string
  kullaniciAdi: string
  telefon: string
  sifre: string
}

interface AuthDeger {
  kullanici: Personel | null
  vatandas: Vatandas | null
  yukleniyor: boolean
  girisYap: (kullaniciAdi: string, sifre: string) => Promise<Sonuc>
  vatandasGiris: (kullaniciAdi: string, sifre: string) => Promise<Sonuc>
  vatandasKayit: (form: VatandasKayitForm) => Promise<Sonuc>
  cikisYap: () => void
}

const AuthContext = createContext<AuthDeger | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [kullanici, setKullanici] = useState<Personel | null>(null)
  const [vatandas, setVatandas] = useState<Vatandas | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)

  // Ilk acilis: token varsa oturum sahibini ve verilerini yukle
  useEffect(() => {
    let iptal = false
    async function baslat() {
      const token = tokenAl()
      if (!token) {
        setYukleniyor(false)
        return
      }
      try {
        const sonuc = await api.get('/api/auth?action=me')
        if (iptal) return
        if (sonuc.tip === 'vatandas') {
          setVatandas(sonuc.kullanici)
          await store.vatandasYukle()
        } else {
          setKullanici(sonuc.kullanici)
          await store.yukle()
        }
      } catch {
        tokenSil()
        if (!iptal) {
          setKullanici(null)
          setVatandas(null)
        }
      } finally {
        if (!iptal) setYukleniyor(false)
      }
    }
    baslat()
    return () => {
      iptal = true
    }
  }, [])

  // Store degisince (kendi profilini guncelleyince) oturumdaki personeli tazele
  useEffect(() => {
    return store.abone(() => {
      setKullanici((onceki) => {
        if (!onceki) return onceki
        const guncel = store.personelGetir(onceki.id)
        return guncel ?? onceki
      })
    })
  }, [])

  const girisYap = async (kullaniciAdi: string, sifre: string): Promise<Sonuc> => {
    try {
      const sonuc = await api.post('/api/auth?action=login', {
        kullaniciAdi: kullaniciAdi.trim(),
        sifre,
      })
      tokenKaydet(sonuc.token)
      setVatandas(null)
      setKullanici(sonuc.kullanici)
      await store.yukle()
      return { basarili: true }
    } catch (e) {
      return { basarili: false, mesaj: (e as Error).message }
    }
  }

  const vatandasGiris = async (
    kullaniciAdi: string,
    sifre: string,
  ): Promise<Sonuc> => {
    try {
      const sonuc = await api.post('/api/auth?action=vatandas-giris', {
        kullaniciAdi: kullaniciAdi.trim(),
        sifre,
      })
      tokenKaydet(sonuc.token)
      setKullanici(null)
      setVatandas(sonuc.kullanici)
      await store.vatandasYukle()
      return { basarili: true }
    } catch (e) {
      return { basarili: false, mesaj: (e as Error).message }
    }
  }

  const vatandasKayit = async (form: VatandasKayitForm): Promise<Sonuc> => {
    try {
      const sonuc = await api.post('/api/auth?action=vatandas-kayit', {
        adSoyad: form.adSoyad.trim(),
        kullaniciAdi: form.kullaniciAdi.trim(),
        telefon: form.telefon.trim(),
        sifre: form.sifre,
      })
      tokenKaydet(sonuc.token)
      setKullanici(null)
      setVatandas(sonuc.kullanici)
      await store.vatandasYukle()
      return { basarili: true }
    } catch (e) {
      return { basarili: false, mesaj: (e as Error).message }
    }
  }

  const cikisYap = () => {
    tokenSil()
    setKullanici(null)
    setVatandas(null)
    store.temizle()
  }

  const deger = useMemo<AuthDeger>(
    () => ({
      kullanici,
      vatandas,
      yukleniyor,
      girisYap,
      vatandasGiris,
      vatandasKayit,
      cikisYap,
    }),
    [kullanici, vatandas, yukleniyor],
  )

  return <AuthContext.Provider value={deger}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthDeger {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalıdır.')
  return ctx
}
