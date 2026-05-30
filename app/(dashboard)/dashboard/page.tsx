'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { libraryApi } from '@/lib/api'
import type { Category } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { CategoryCard } from '@/components/CategoryCard'
import { AccountStatusBanner } from '@/components/AccountStatusBanner'

export default function DashboardPage() {
  const { user, packCategoryIds, isLoading: authLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    libraryApi
      .getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const hasFullAccess =
    user?.is_beta ||
    user?.active_subscription?.status === 'active' ||
    user?.active_subscription?.status === 'beta'

  if (authLoading || loading) {
    return <div className="p-8 text-zinc-500">Loading library…</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Library</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {hasFullAccess
              ? 'Full access — browse any category.'
              : packCategoryIds.length > 0
                ? 'You have access to purchased category packs.'
                : 'Subscribe or buy a category pack to unlock models.'}
          </p>
        </div>
        {!hasFullAccess && (
          <Link
            href="/pricing"
            className="text-sm bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition shrink-0"
          >
            Upgrade for full access
          </Link>
        )}
      </div>

      <AccountStatusBanner />

      <Link
        href="/dashboard/plugin"
        className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-300 transition"
      >
        <div>
          <p className="text-sm font-medium text-zinc-900">Get the SketchUp plugin</p>
          <p className="text-sm text-zinc-500">
            Insert models directly inside SketchUp. Download &amp; install guide →
          </p>
        </div>
        <span className="text-sm bg-zinc-900 text-white px-4 py-2 rounded-lg shrink-0">
          Download
        </span>
      </Link>

      {error && (
        <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3 mb-6">
          Could not load categories. Is the API running?
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const hasAccess = hasFullAccess || packCategoryIds.includes(cat.id)
          return <CategoryCard key={cat.id} category={cat} hasAccess={hasAccess} />
        })}
      </div>
    </div>
  )
}
