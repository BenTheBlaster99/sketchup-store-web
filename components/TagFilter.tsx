'use client'

import type { GroupedTags } from '@/lib/types'

interface TagFilterProps {
  groupedTags: GroupedTags
  activeSlugs: string[]
  onToggle: (slug: string) => void
  onClear: () => void
}

const GROUP_LABELS: Record<string, string> = {
  type: 'Furniture type',
  material: 'Material',
  style: 'Style',
}

export function TagFilter({ groupedTags, activeSlugs, onToggle, onClear }: TagFilterProps) {
  const groups = Object.entries(groupedTags).filter(([, tags]) => tags.length > 0)

  if (groups.length === 0) return null

  return (
    <div className="mb-6 space-y-4">
      {groups.map(([group, tags]) => (
        <div key={group}>
          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">
            {GROUP_LABELS[group] ?? group}
          </p>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      ))}

      {activeSlugs.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="px-3 py-1 text-sm text-zinc-400 hover:text-zinc-900"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}
