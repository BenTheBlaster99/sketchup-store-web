'use client'

import type { Tag } from '@/lib/types'

interface TagFilterProps {
  tags: Tag[]
  activeSlugs: string[]
  onToggle: (slug: string) => void
  onClear: () => void
}

export function TagFilter({ tags, activeSlugs, onToggle, onClear }: TagFilterProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tags.map((tag) => {
        const active = activeSlugs.includes(tag.slug)
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag.slug)}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              active
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
            }`}
          >
            #{tag.name}
          </button>
        )
      })}
      {activeSlugs.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="px-3 py-1 text-sm text-zinc-400 hover:text-zinc-900"
        >
          Clear
        </button>
      )}
    </div>
  )
}
