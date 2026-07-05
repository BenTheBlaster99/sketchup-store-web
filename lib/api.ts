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

  getTags: () => api.get<import('@/lib/types').GroupedTags>('/tags'),

  getCategoryModels: (slug: string, tagSlugs: string[] = []) =>
    api.get<{ category: import('@/lib/types').Category; models: import('@/lib/types').Model3D[] }>(
      `/categories/${slug}/models`,
      { params: tagSlugs.length ? { tags: tagSlugs.join(',') } : undefined },
    ),

  downloadModel: (modelId: number) =>
    api.post<{ download_url: string }>(`/models/${modelId}/download`),
}

export const waitlistApi = {
  join: (data: { email: string; name?: string }) =>
    api.post<{ message: string; already_joined?: boolean }>('/waitlist', data),
}

export const favoritesApi = {
  toggle: (modelId: number) =>
    api.post<{ favorited: boolean; likes_count: number }>(`/models/${modelId}/favorite`),

  list: () => api.get<import('@/lib/types').Model3D[]>('/models/favorites'),
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

export const creatorApi = {
  apply: (data: { bio: string; portfolio_url?: string; paypal_email: string }) =>
    api.post('/creator/apply', data),

  appStatus: () => api.get<import('@/lib/types').CreatorApplication | null>('/creator/apply/status'),

  getModels: () => api.get<import('@/lib/types').Model3D[]>('/creator/models'),

  presign: (params: {
    file_name: string
    file_type: string
    thumbnail_name: string
    thumbnail_type: string
    category_slug: string
  }) => api.get<import('@/lib/types').CreatorPresignResponse>('/creator/upload/presign', { params }),

  autotag: (data: { thumbnail_key?: string; thumbnail_url?: string }) =>
    api.post<import('@/lib/types').CreatorAutotagResponse>('/creator/upload/autotag', data),

  confirmUpload: (data: {
    category_id: number
    name: string
    file_key: string
    thumbnail_key: string
    file_size_bytes: number
    sketchup_version_min: number
    tag_ids: number[]
  }) => api.post('/creator/models', data),

  getEarnings: () => api.get<import('@/lib/types').CreatorEarnings>('/creator/earnings'),

  updateProfile: (data: {
    display_name?: string
    bio?: string
    paypal_email?: string
  }) => api.put<import('@/lib/types').User>('/creator/profile', data),
}
