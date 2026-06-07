const TOKEN_KEY = 'lsms_token'

export function tokenAl(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function tokenKaydet(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function tokenSil(): void {
  localStorage.removeItem(TOKEN_KEY)
}

async function istek(yol: string, secenekler: RequestInit = {}): Promise<any> {
  const token = tokenAl()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((secenekler.headers as Record<string, string>) || {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const yanit = await fetch(yol, { ...secenekler, headers })
  const metin = await yanit.text()
  const veri = metin ? JSON.parse(metin) : null

  if (!yanit.ok) {
    throw new Error((veri && veri.hata) || 'İstek başarısız oldu.')
  }
  return veri
}

export const api = {
  get: (yol: string) => istek(yol),
  post: (yol: string, govde?: any) =>
    istek(yol, { method: 'POST', body: JSON.stringify(govde ?? {}) }),
  patch: (yol: string, govde?: any) =>
    istek(yol, { method: 'PATCH', body: JSON.stringify(govde ?? {}) }),
  delete: (yol: string) => istek(yol, { method: 'DELETE' }),
}
