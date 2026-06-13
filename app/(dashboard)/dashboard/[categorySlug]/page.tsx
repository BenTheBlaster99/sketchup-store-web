'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { libraryApi } from '@/lib/api'
import type { Category, Model3D, Tag } from '@/lib/types'
import { ModelCard } from '@/components/ModelCard'
import { TagFilter } from '@/components/TagFilter'

function CategoryModelsContent({
  categorySlug,
  activeTags,
  tags,
  onToggleTag,
  onClearTags,
}: {
  categorySlug: string
  activeTags: string[]
  tags: Tag[]
  onToggleTag: (slug: string) => void
  onClearTags: () => void
}) {
  const [category, setCategory] = useState<Category | null>(null)
  const [models, setModels] = useState<Model3D[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const res = await libraryApi.getCategoryModels(categorySlug, activeTags)
        if (cancelled) return
        setCategory(res.data.category)
        setModels(res.data.models)
      } catch (err) {
        if (cancelled) return
        const message = axios.isAxiosError(err)
          ? ((err.response?.data?.message as string | undefined) ??
            (err.response?.status === 403
              ? 'You do not have access to this category.'
              : 'Failed to load models'))
          : 'Failed to load models'
        setError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [categorySlug, activeTags])

  if (loading) {
    return <div className="p-8 text-zinc-500">Loading models…</div>
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900 mb-6 inline-block">
          ← Back to library
        </Link>
        <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
        <Link
          href="/pricing"
          className="inline-block mt-4 text-sm bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition"
        >
          View pricing
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900 mb-6 inline-block">
        ← Back to library
      </Link>

      <h1 className="text-2xl font-semibold text-zinc-900 mb-2">{category?.name}</h1>
      <p className="text-zinc-500 mb-4">
        {models.length} model{models.length === 1 ? '' : 's'}
        {activeTags.length > 0 && ' matching filters'}
      </p>

      <TagFilter
        tags={tags}
        activeSlugs={activeTags}
        onToggle={onToggleTag}
        onClear={onClearTags}
      />

      {models.length === 0 ? (
        <p className="text-zinc-500 border border-dashed border-zinc-300 rounded-xl px-4 py-8 text-center bg-white">
          {activeTags.length > 0
            ? 'No models match these tags. Try clearing filters.'
            : 'No published models in this category yet.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {models.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategoryModelsPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const [tags, setTags] = useState<Tag[]>([])
  const [activeTags, setActiveTags] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false

    void libraryApi.getTags().then((res) => {
      if (!cancelled) setTags(res.data)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const toggleTag = (slug: string) => {
    setActiveTags((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug],
    )
  }

  if (!categorySlug) {
    return null
  }

  return (
    <CategoryModelsContent
      key={`${categorySlug}-${activeTags.join(',')}`}
      categorySlug={categorySlug}
      activeTags={activeTags}
      tags={tags}
      onToggleTag={toggleTag}
      onClearTags={() => setActiveTags([])}
    />
  )
}
