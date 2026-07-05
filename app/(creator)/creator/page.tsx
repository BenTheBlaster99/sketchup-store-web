'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { creatorApi } from '@/lib/api'
import type { CreatorEarnings, Model3D } from '@/lib/types'
import { formatDzd } from '@/lib/utils'

function ModelList({
  models,
  showRejection = false,
}: {
  models: Model3D[]
  showRejection?: boolean
}) {
  return (
    <div className="space-y-2">
      {models.map((model) => (
        <div
          key={model.id}
          className="border border-zinc-200 rounded-xl p-4 flex items-center justify-between bg-white"
        >
          <div>
            <p className="font-medium text-sm text-zinc-900">{model.name}</p>
            <p className="text-xs text-zinc-400">{model.category?.name ?? 'Uncategorized'}</p>
            {showRejection && model.rejection_note && (
              <p className="text-xs text-red-600 mt-1">Reason: {model.rejection_note}</p>
            )}
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              model.review_status === 'approved'
                ? 'bg-green-100 text-green-700'
                : model.review_status === 'pending_review'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {model.review_status === 'pending_review' ? 'Pending review' : model.review_status}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function CreatorDashboardPage() {
  const [models, setModels] = useState<Model3D[]>([])
  const [earnings, setEarnings] = useState<CreatorEarnings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void Promise.all([
      creatorApi.getModels().then((res) => setModels(res.data)),
      creatorApi.getEarnings().then((res) => setEarnings(res.data)),
    ]).finally(() => setLoading(false))
  }, [])

  const pending = models.filter((m) => m.review_status === 'pending_review')
  const approved = models.filter((m) => m.review_status === 'approved')
  const rejected = models.filter((m) => m.review_status === 'rejected')

  if (loading) {
    return <div className="p-8 text-zinc-500">Loading creator dashboard…</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Creator dashboard</h1>
        <Link
          href="/creator/upload"
          className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800 transition"
        >
          Upload model
        </Link>
      </div>

      {earnings && (
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="border border-zinc-200 rounded-2xl p-5 bg-white">
            <p className="text-sm text-zinc-500 mb-1">Your downloads this month</p>
            <p className="text-3xl font-semibold text-zinc-900">
              {earnings.current_month.your_downloads}
            </p>
            <p className="text-xs text-zinc-400 mt-1">{earnings.current_month.label}</p>
          </div>
          <div className="border border-zinc-200 rounded-2xl p-5 bg-white">
            <p className="text-sm text-zinc-500 mb-1">Your share of creator downloads</p>
            <p className="text-3xl font-semibold text-zinc-900">
              {earnings.current_month.your_share_percent}%
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              of {earnings.current_month.total_creator_downloads} creator downloads
            </p>
          </div>
          <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-900 text-white">
            <p className="text-sm text-zinc-400 mb-1">Estimated payout</p>
            <p className="text-3xl font-semibold">
              {formatDzd(earnings.current_month.your_estimated_earnings)}
            </p>
            <Link href="/creator/earnings" className="text-xs text-zinc-400 mt-1 inline-block hover:text-white">
              View breakdown →
            </Link>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="font-medium text-zinc-900 mb-3 flex items-center gap-2">
            Pending review
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          </h2>
          <ModelList models={pending} />
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-medium text-zinc-900 mb-3">Live models ({approved.length})</h2>
        {approved.length === 0 ? (
          <p className="text-zinc-400 text-sm">No approved models yet.</p>
        ) : (
          <ModelList models={approved} />
        )}
      </div>

      {rejected.length > 0 && (
        <div>
          <h2 className="font-medium text-red-600 mb-3">Rejected ({rejected.length})</h2>
          <ModelList models={rejected} showRejection />
        </div>
      )}
    </div>
  )
}
