export interface User {
  id: number
  name: string
  email: string
  is_admin: boolean
  is_student: boolean
  is_beta: boolean
  active_subscription?: Subscription | null
}

export interface Plan {
  id: number
  slug: string
  name: string
  price_dzd: number
  duration_months: number
  is_student: boolean
}

export interface Subscription {
  id: number
  user_id: number
  plan_id: number
  plan?: Plan
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'beta' | 'rejected'
  payment_ref: string | null
  payer_name: string | null
  starts_at: string | null
  ends_at: string | null
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  cover_image_key: string | null
  model_count?: number
  pack?: CategoryPack | null
}

export interface Model3D {
  id: number
  category_id: number
  name: string
  slug: string
  thumbnail_url: string
  file_size_bytes: number
  sketchup_version_min: number
  is_published: boolean
}

export interface CategoryPack {
  id: number
  category_id: number
  price_dzd: number
  is_active: boolean
}

export interface PackPurchase {
  id: number
  user_id: number
  category_id: number
  category?: Category
  status: 'pending' | 'active' | 'rejected'
  price_paid_dzd: number
}

export interface AuthState {
  user: User | null
  token: string | null
  packCategoryIds: number[]
  isLoading: boolean
}
