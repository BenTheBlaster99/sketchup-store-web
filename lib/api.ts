import axios from 'axios'
import Cookies from 'js-cookie'

// Production note: Bearer tokens in js-cookie are readable by JS (XSS risk).
// Before go-live, migrate to Laravel Sanctum SPA mode (httpOnly cookies).
// Backend CORS + SANCTUM_STATEFUL_DOMAINS are already configured for this.

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('auth_token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(err)
  },
)

export default api

export const authApi = {
  register: (data: {
    name: string
    email: string
    password: string
    password_confirmation: string
    is_student?: boolean
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),
}

export const libraryApi = {
  getCategories: () => api.get<import('@/lib/types').Category[]>('/categories'),

  getPlans: () => api.get<import('@/lib/types').Plan[]>('/plans'),

  getCategoryModels: (slug: string) =>
    api.get<{ category: import('@/lib/types').Category; models: import('@/lib/types').Model3D[] }>(
      `/categories/${slug}/models`,
    ),

  downloadModel: (modelId: number) =>
    api.post<{ download_url: string }>(`/models/${modelId}/download`),
}

export const subscriptionApi = {
  getCurrent: () => api.get('/subscriptions/current'),

  create: (data: { plan_id: number; payer_name: string; payment_ref: string }) =>
    api.post('/subscriptions', data),
}

export const packApi = {
  getPurchased: () => api.get<import('@/lib/types').PackPurchase[]>('/packs/purchased'),

  purchase: (categoryId: number, data: { payer_name: string; payment_ref: string }) =>
    api.post(`/packs/${categoryId}`, data),
}
