'use client'

import { useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import { libraryApi } from '@/lib/api'
import type { Model3D } from '@/lib/types'
import { formatFileSize, triggerFileDownload } from '@/lib/utils'

interface ModelCardProps {
  model: Model3D
}

export function ModelCard({ model }: ModelCardProps) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        <p className="text-xs text-zinc-500 mt-0.5">
          SketchUp {model.sketchup_version_min}+ · {formatFileSize(model.file_size_bytes)}
        </p>

        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="mt-2 w-full text-xs bg-zinc-900 text-white py-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition"
        >
          {downloading ? 'Preparing…' : 'Download .skp'}
        </button>
      </div>
    </div>
  )
}
