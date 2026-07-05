'use client'

import { useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import { favoritesApi, libraryApi } from '@/lib/api'
import type { Model3D } from '@/lib/types'
import { formatFileSize, triggerFileDownload } from '@/lib/utils'

interface ModelCardProps {
  model: Model3D
}

export function ModelCard({ model }: ModelCardProps) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [favorited, setFavorited] = useState(model.is_favorited ?? false)
  const [likes, setLikes] = useState(model.likes_count ?? 0)
  const [toggling, setToggling] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    setError(null)
    try {
      const res = await libraryApi.downloadModel(model.id)
      triggerFileDownload(res.data.download_url, model.slug || model.name)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? ((err.response?.data?.message as string | undefined) ?? 'Download failed')
        : 'Download failed'
      setError(message)
    } finally {
      setDownloading(false)
    }
  }

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (toggling) return
    setToggling(true)
    try {
      const res = await favoritesApi.toggle(model.id)
      setFavorited(res.data.favorited)
      setLikes(res.data.likes_count)
    } catch {
      // 401 handled by api interceptor
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden group">
      <div className="aspect-square bg-zinc-50 relative overflow-hidden">
        {model.thumbnail_url ? (
          <Image
            src={model.thumbnail_url}
            alt={model.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
            No preview
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition pointer-events-none" />
      </div>

      <div className="p-3">
        <p className="text-sm font-medium text-zinc-900 truncate">{model.name}</p>
        {model.creator && (
          <p className="text-xs text-zinc-400 mt-0.5">
            by {model.creator.display_name ?? model.creator.name}
          </p>
        )}
        <p className="text-xs text-zinc-500 mt-0.5">
          SketchUp {model.sketchup_version_min}+ · {formatFileSize(model.file_size_bytes)}
        </p>

        {model.tags && model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5 mb-1">
            {model.tags.map((tag) => (
              <span key={tag.id} className="text-xs text-zinc-400">
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-2 mb-2">
          <span className="text-xs text-zinc-400">
            {likes} {likes === 1 ? 'like' : 'likes'}
          </span>
          <button
            type="button"
            onClick={handleFavorite}
            disabled={toggling}
            aria-label={favorited ? 'Remove from saved' : 'Save and like'}
            className={`text-lg leading-none transition disabled:opacity-50 ${
              favorited ? 'text-red-500' : 'text-zinc-300 hover:text-red-400'
            }`}
          >
            {favorited ? '♥' : '♡'}
          </button>
        </div>

        {error && <p className="text-xs text-red-600 mb-1">{error}</p>}

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="w-full text-xs bg-zinc-900 text-white py-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition"
        >
          {downloading ? 'Preparing…' : 'Download .skp'}
        </button>
      </div>
    </div>
  )
}
