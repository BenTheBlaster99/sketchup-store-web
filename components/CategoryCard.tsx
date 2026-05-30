'use client'

import Link from 'next/link'
import type { Category } from '@/lib/types'
import { formatDzd } from '@/lib/utils'

interface CategoryCardProps {
  category: Category
  hasAccess: boolean
}

export function CategoryCard({ category, hasAccess }: CategoryCardProps) {
  return (
    <div className="relative bg-white border border-zinc-200 rounded-2xl overflow-hidden group">
      <div className="aspect-square bg-zinc-100 flex items-center justify-center">
        <span className="text-zinc-500 text-sm font-medium">{category.name}</span>
      </div>

      <div className="p-3">
        <p className="font-medium text-sm text-zinc-900">{category.name}</p>
        <p className="text-xs text-zinc-500">{category.model_count ?? 0} models</p>
      </div>

      {!hasAccess && (
        <span className="absolute top-2 right-2 bg-zinc-900 text-white text-xs px-2 py-1 rounded-md">
          Locked
        </span>
      )}

      {hasAccess ? (
        <Link
          href={`/dashboard/${category.slug}`}
          className="absolute inset-0"
          aria-label={`Browse ${category.name}`}
        />
      ) : (
        <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
          <p className="text-sm font-medium text-zinc-900">No access</p>
          {category.pack && (
            <Link
              href={`/checkout/pack/${category.id}`}
              className="text-xs bg-zinc-900 text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition"
            >
              Buy for {formatDzd(category.pack.price_dzd)}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
