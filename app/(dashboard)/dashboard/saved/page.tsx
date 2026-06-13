'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { favoritesApi } from '@/lib/api'
import type { Model3D } from '@/lib/types'
import { ModelCard } from '@/components/ModelCard'

export default function SavedModelsPage() {
  const [models, setModels] = useState<Model3D[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    void favoritesApi
      .list()
      .then((res) => {
        if (!cancelled) setModels(res.data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <div className="p-8 text-zinc-500">Loading saved models…</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900 mb-6 inline-block">
        ← Back to library
      </Link>

      <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Saved models</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Models you liked with ♡ — saved privately to your account.
      </p>

      {error && (
        <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3 mb-6">
          Could not load saved models.
        </p>
      )}

      {models.length === 0 ? (
        <p className="text-zinc-500 border border-dashed border-zinc-300 rounded-xl px-4 py-8 text-center bg-white">
          No saved models yet. Hit ♡ on any model in the library to save it here.
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
