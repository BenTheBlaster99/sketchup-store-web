'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { libraryApi } from '@/lib/api'
import type { Plan } from '@/lib/types'
import { formatDzd } from '@/lib/utils'

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    libraryApi
      .getPlans()
      .then((res) => setPlans(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const regular = plans.filter((p) => !p.is_student)
  const student = plans.filter((p) => p.is_student)

  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-semibold text-center text-zinc-900 mb-4">Simple pricing</h1>
      <p className="text-center text-zinc-600 mb-12">
        Full access to every 3D model in the library.
      </p>

      {loading && <p className="text-center text-zinc-500">Loading plans…</p>}

      {error && (
        <p className="text-center text-red-600 bg-red-50 rounded-lg px-4 py-3">
          Could not load plans. Is the API running?
        </p>
      )}

      {!loading && !error && (
        <>
          <section className="mb-12">
            <h2 className="text-lg font-medium text-zinc-900 mb-4">Regular</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {regular.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium text-zinc-900 mb-4">Student</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {student.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </section>
        </>
      )}

      <p className="text-center text-sm text-zinc-500 mt-12">
        Only need one category?{' '}
        <Link href="/dashboard" className="text-zinc-900 underline hover:no-underline">
          Browse category packs
        </Link>
      </p>
    </main>
  )
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6">
      <p className="text-sm text-zinc-500 mb-1">
        {plan.duration_months === 1 ? 'Monthly' : 'Yearly'}
      </p>
      <p className="text-3xl font-semibold text-zinc-900">
        {plan.price_dzd.toLocaleString()}{' '}
        <span className="text-lg font-normal text-zinc-500">DZD</span>
      </p>
      {plan.duration_months === 12 && (
        <p className="text-sm text-green-700 mt-1">
          {Math.round(plan.price_dzd / 12).toLocaleString()} DZD/month
        </p>
      )}
      <p className="text-sm text-zinc-600 mt-2">{plan.name}</p>
      <Link
        href={`/checkout/subscription?planId=${plan.id}`}
        className="block mt-4 text-center bg-zinc-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition"
      >
        Get started — {formatDzd(plan.price_dzd)}
      </Link>
    </div>
  )
}
