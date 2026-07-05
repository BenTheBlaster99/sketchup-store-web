'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { creatorApi, libraryApi } from '@/lib/api'
import type { Category, GroupedTags, Tag } from '@/lib/types'
import { Button } from '@/components/ui/Button'

const GROUP_LABELS: Record<string, string> = {
  type: 'Furniture type',
  material: 'Material',
  style: 'Style',
}

export default function CreatorUploadPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [allTags, setAllTags] = useState<GroupedTags>({})
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [suggestedTagIds, setSuggestedTagIds] = useState<number[]>([])
  const [autotagging, setAutotagging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [categoryId, setCategoryId] = useState('')
  const [name, setName] = useState('')
  const [versionMin, setVersionMin] = useState(2022)
  const modelFileRef = useRef<HTMLInputElement>(null)
  const thumbFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void Promise.all([
      libraryApi.getCategories().then((res) => setCategories(res.data)),
      libraryApi.getTags().then((res) => setAllTags(res.data)),
    ])
  }, [])

  const handleThumbnailChange = async () => {
    const file = thumbFileRef.current?.files?.[0]
    if (!file || !categoryId) return

    const category = categories.find((c) => c.id === Number(categoryId))
    if (!category) return

    setAutotagging(true)
    setSuggestedTagIds([])
    setError(null)

    try {
      const presignRes = await creatorApi.presign({
        file_name: 'temp.skp',
        file_type: 'application/octet-stream',
        thumbnail_name: file.name,
        thumbnail_type: file.type || 'image/jpeg',
        category_slug: category.slug,
      })

      await axios.put(presignRes.data.thumb_upload_url, file, {
        headers: { 'Content-Type': file.type || 'image/jpeg' },
      })

      const autotagRes = await creatorApi.autotag({
        thumbnail_key: presignRes.data.thumb_key,
      })

      const suggested = autotagRes.data.suggested_tag_ids
      setSuggestedTagIds(suggested)
      setSelectedTagIds((prev) => [...new Set([...prev, ...suggested])])
    } catch {
      // Autotag failure is non-fatal — creator picks tags manually
    } finally {
      setAutotagging(false)
    }
  }

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id],
    )
  }

  const handleUpload = async () => {
    const modelFile = modelFileRef.current?.files?.[0]
    const thumbFile = thumbFileRef.current?.files?.[0]
    if (!modelFile || !thumbFile || !categoryId || !name.trim()) return

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const category = categories.find((c) => c.id === Number(categoryId))
      if (!category) return

      const presignRes = await creatorApi.presign({
        file_name: modelFile.name,
        file_type: 'application/octet-stream',
        thumbnail_name: thumbFile.name,
        thumbnail_type: thumbFile.type || 'image/jpeg',
        category_slug: category.slug,
      })

      const { file_upload_url, file_key, thumb_upload_url, thumb_key } = presignRes.data

      await axios.put(file_upload_url, modelFile, {
        headers: { 'Content-Type': 'application/octet-stream' },
        onUploadProgress: (event) =>
          setProgress(Math.round((event.loaded / (event.total ?? 1)) * 80)),
      })

      await axios.put(thumb_upload_url, thumbFile, {
        headers: { 'Content-Type': thumbFile.type || 'image/jpeg' },
      })
      setProgress(90)

      await creatorApi.confirmUpload({
        category_id: Number(categoryId),
        name: name.trim(),
        file_key,
        thumbnail_key: thumb_key,
        file_size_bytes: modelFile.size,
        sketchup_version_min: versionMin,
        tag_ids: selectedTagIds,
      })

      setProgress(100)
      setDone(true)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? ((err.response?.data?.message as string | undefined) ?? 'Upload failed')
        : 'Upload failed'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setDone(false)
    setProgress(0)
    setSelectedTagIds([])
    setSuggestedTagIds([])
    setName('')
    setCategoryId('')
    setError(null)
    if (modelFileRef.current) modelFileRef.current.value = ''
    if (thumbFileRef.current) thumbFileRef.current.value = ''
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Model submitted for review</h1>
        <p className="text-zinc-500 mb-6">
          Sarah will review your model and approve it shortly. You&apos;ll see it in your
          dashboard once it&apos;s live.
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="text-sm text-zinc-900 underline mr-4"
        >
          Upload another
        </button>
        <button
          type="button"
          onClick={() => router.push('/creator')}
          className="bg-zinc-900 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-zinc-800 transition"
        >
          Back to dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 mb-8">Upload a model</h1>

      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1">Model name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="L-Shape Sofa 3-Seat"
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">Select category…</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1">
              SketchUp file (.skp)
            </label>
            <input
              ref={modelFileRef}
              type="file"
              accept=".skp"
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1">
              Thumbnail image
              {autotagging && (
                <span className="ml-2 text-xs text-blue-600 font-normal">
                  Analyzing with AI…
                </span>
              )}
            </label>
            <input
              ref={thumbFileRef}
              type="file"
              accept="image/*"
              onChange={() => void handleThumbnailChange()}
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm bg-white"
            />
            {!categoryId && (
              <p className="text-xs text-zinc-400 mt-1">Select a category first for AI tag suggestions.</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-900 mb-1">
            Min SketchUp version
          </label>
          <select
            value={versionMin}
            onChange={(e) => setVersionMin(Number(e.target.value))}
            className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((version) => (
              <option key={version} value={version}>
                {version}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-900 mb-2">
            Tags
            {suggestedTagIds.length > 0 && (
              <span className="ml-2 text-xs text-blue-600 font-normal">
                AI suggestions pre-selected
              </span>
            )}
          </label>
          {Object.entries(allTags).map(([group, tags]) => (
            <TagGroup
              key={group}
              group={group}
              tags={tags}
              selectedTagIds={selectedTagIds}
              suggestedTagIds={suggestedTagIds}
              onToggle={toggleTag}
            />
          ))}
        </div>

        {progress > 0 && (
          <div className="w-full bg-zinc-100 rounded-full h-2">
            <div
              className="bg-zinc-900 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
        )}

        <Button
          type="button"
          onClick={() => void handleUpload()}
          disabled={uploading || !name.trim() || !categoryId}
          className="w-full"
        >
          {uploading ? `Uploading… ${progress}%` : 'Submit for review'}
        </Button>
      </div>
    </div>
  )
}

function TagGroup({
  group,
  tags,
  selectedTagIds,
  suggestedTagIds,
  onToggle,
}: {
  group: string
  tags: Tag[]
  selectedTagIds: number[]
  suggestedTagIds: number[]
  onToggle: (id: number) => void
}) {
  if (tags.length === 0) return null

  return (
    <div className="mb-3">
      <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">
        {GROUP_LABELS[group] ?? group}
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id)
          const isSuggested = suggestedTagIds.includes(tag.id)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggle(tag.id)}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                isSelected
                  ? isSuggested
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              #{tag.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
