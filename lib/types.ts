export interface User {
  id: number
  name: string
  email: string
  is_admin: boolean
  is_student: boolean
  is_beta: boolean
  is_creator?: boolean
  creator_status?: 'none' | 'pending' | 'approved' | 'suspended'
  display_name?: string | null
  bio?: string | null
  paypal_email?: string | null
  revenue_share_percentage?: number
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

export interface Tag {
  id: number
  name: string
  slug: string
  group?: 'type' | 'material' | 'style' | string
}

export type GroupedTags = Record<string, Tag[]>

export interface ModelCreator {
  id: number
  name: string
  display_name: string | null
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
  likes_count?: number
  is_favorited?: boolean
  tags?: Tag[]
  creator_id?: number | null
  creator?: ModelCreator
  category?: Category
  review_status?: 'approved' | 'pending_review' | 'rejected'
  rejection_note?: string | null
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

export interface CreatorApplication {
  id: number
  status: 'pending' | 'approved' | 'rejected'
  bio: string
  portfolio_url: string | null
  paypal_email: string
  admin_note?: string | null
}

export interface CreatorEarnings {
  paypal_email: string | null
  platform_split: number
  creator_pool_split: number
  current_month: {
    label: string
    total_platform_revenue: number
    creator_pool_total: number
    platform_keeps: number
    your_downloads: number
    total_creator_downloads: number
    your_share_percent: number
    your_estimated_earnings: number
  }
  top_models: Array<{
    model_id: number
    model_name: string
    download_count: number
  }>
}

export interface AuthState {
  user: User | null
  token: string | null
  packCategoryIds: number[]
  isLoading: boolean
}

export interface CreatorPresignResponse {
  file_upload_url: string
  file_key: string
  thumb_upload_url: string
  thumb_key: string
}

export interface CreatorAutotagResponse {
  suggested_tag_ids: number[]
  suggested_tags: Tag[]
}
