'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { subscriptionApi } from '@/lib/api'
import type { Subscription } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'

export function AccountStatusBanner() {
  const { user } = useAuth()
  const [pendingSub, setPendingSub] = useState<Subscription | null>(null)

  useEffect(() => {
    if (!user || user.is_beta || user.active_subscription) {
      return
    }

    let cancelled = false

    void subscriptionApi.getCurrent().then((res) => {
      if (cancelled) return
      const sub = res.data as Subscription | null
      if (sub?.status === 'pending') {
        setPendingSub(sub)
      }
    })

    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) return null

  if (user.is_beta) {
    return (
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <Badge variant="info" className="mb-2">
          Beta access
        </Badge>
        <p>Full library access — beta account.</p>
      </div>
    )
  }

  const sub = user.active_subscription
  if (sub?.status === 'active' && sub.ends_at) {
    return (
      <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
        <Badge variant="success" className="mb-2">
          Subscription active
        </Badge>
        <p>
          Full access until{' '}
          <strong>{new Date(sub.ends_at).toLocaleDateString()}</strong>.
        </p>
      </div>
    )
  }

  if (sub?.status === 'active') {
    return (
      <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
        <Badge variant="success" className="mb-2">
          Subscription active
        </Badge>
        <p>Full library access.</p>
      </div>
    )
  }

  if (pendingSub) {
    return (
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <Badge variant="warning" className="mb-2">
          Payment under review
        </Badge>
        <p>
          Your subscription payment is being verified. You&apos;ll get full access within 24
          hours once approved.
          {pendingSub.plan?.name && (
            <>
              {' '}
              Plan: <strong>{pendingSub.plan.name}</strong>.
            </>
          )}
        </p>
      </div>
    )
  }

  if (!user.is_beta && !sub) {
    return (
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
        No active subscription.{' '}
        <Link href="/pricing" className="text-zinc-900 underline hover:no-underline">
          View plans
        </Link>{' '}
        or buy a category pack below.
      </div>
    )
  }

  return null
}
