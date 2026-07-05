'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { creatorApi } from '@/lib/api'
import type { CreatorEarnings } from '@/lib/types'
import { formatDzd } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export default function CreatorEarningsPage() {
  const [data, setData] = useState<CreatorEarnings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [paypalEmail, setPaypalEmail] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    void creatorApi
      .getEarnings()
      .then((res) => {
        setData(res.data)
        setPaypalEmail(res.data.paypal_email ?? '')
      })
      .catch(() => setError('Could not load earnings data.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaved(false)
    setError(null)

    try {
      const res = await creatorApi.updateProfile({
        display_name: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        paypal_email: paypalEmail.trim() || undefined,
      })
      setPaypalEmail(res.data.paypal_email ?? '')
      setData((prev) => (prev ? { ...prev, paypal_email: res.data.paypal_email ?? null } : prev))
      setSaved(true)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? ((err.response?.data?.message as string | undefined) ?? 'Could not save profile')
        : 'Could not save profile'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-zinc-500">Loading earnings…</div>
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
        )}
      </div>
    )
  }

  const month = data.current_month

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Earnings</h1>
      <p className="text-zinc-500 mb-8">{month.label}</p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 mb-6">{error}</p>
      )}

      <div className="bg-zinc-100 rounded-2xl p-5 mb-8">
        <p className="text-sm font-medium text-zinc-900 mb-3">How payouts work</p>
        <p className="text-sm text-zinc-600">
          {data.creator_pool_split}% of total subscription revenue goes into the creator pool.
          Your share of the pool equals your share of all creator model downloads that month.
          Sarah sends PayPal transfers at the end of each month.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="border border-zinc-200 rounded-2xl p-4 bg-white">
          <p className="text-xs text-zinc-500 mb-1">Your downloads</p>
          <p className="text-2xl font-semibold text-zinc-900">{month.your_downloads}</p>
        </div>
        <div className="border border-zinc-200 rounded-2xl p-4 bg-white">
          <p className="text-xs text-zinc-500 mb-1">Total creator downloads</p>
          <p className="text-2xl font-semibold text-zinc-900">{month.total_creator_downloads}</p>
        </div>
        <div className="border border-zinc-200 rounded-2xl p-4 bg-white">
          <p className="text-xs text-zinc-500 mb-1">Your share</p>
          <p className="text-2xl font-semibold text-zinc-900">{month.your_share_percent}%</p>
        </div>
        <div className="border border-zinc-200 rounded-2xl p-4 bg-zinc-900 text-white">
          <p className="text-xs text-zinc-400 mb-1">Estimated payout</p>
          <p className="text-2xl font-semibold">
            {formatDzd(month.your_estimated_earnings)}
          </p>
        </div>
      </div>

      <div className="border border-zinc-200 rounded-2xl p-5 mb-8 space-y-2 bg-white">
        <p className="text-sm font-medium text-zinc-900 mb-3">This month&apos;s calculation</p>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Total platform revenue</span>
          <span>{formatDzd(month.total_platform_revenue)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Creator pool ({data.creator_pool_split}%)</span>
          <span>{formatDzd(month.creator_pool_total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Platform keeps ({data.platform_split}%)</span>
          <span>{formatDzd(month.platform_keeps)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Your download share</span>
          <span>{month.your_share_percent}%</span>
        </div>
        <div className="border-t border-zinc-100 pt-2 flex justify-between text-sm font-semibold text-zinc-900">
          <span>Your estimated payout</span>
          <span>{formatDzd(month.your_estimated_earnings)}</span>
        </div>
      </div>

      {data.paypal_email && (
        <p className="text-sm text-zinc-500 mb-8">
          Paid to: <span className="font-medium text-zinc-900">{data.paypal_email}</span>
        </p>
      )}

      {data.top_models.length > 0 && (
        <div className="mb-10">
          <h2 className="font-medium text-zinc-900 mb-4">Downloads by model</h2>
          <div className="space-y-2">
            {data.top_models.map((model) => (
              <div
                key={model.model_id}
                className="flex justify-between border border-zinc-200 rounded-xl px-4 py-3 text-sm bg-white"
              >
                <span className="text-zinc-900">{model.model_name}</span>
                <span className="font-medium text-zinc-600">
                  {model.download_count} download{model.download_count === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border border-zinc-200 rounded-2xl p-6 bg-white">
        <h2 className="font-medium text-zinc-900 mb-4">Payout profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How your name appears on models"
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1">PayPal email</label>
            <input
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              type="email"
              placeholder="yourpaypal@email.com"
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Short bio for your creator profile"
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" onClick={() => void handleSaveProfile()} disabled={saving}>
              {saving ? 'Saving…' : 'Save profile'}
            </Button>
            {saved && <span className="text-sm text-green-600">Saved</span>}
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-400 mt-6">
        Payouts are estimated from active subscriptions. Final amounts are sent manually via
        PayPal at month end.
      </p>
    </div>
  )
}
