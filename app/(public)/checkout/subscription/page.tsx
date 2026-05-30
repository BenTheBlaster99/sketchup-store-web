'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Link from 'next/link'
import { libraryApi, subscriptionApi } from '@/lib/api'
import type { Plan } from '@/lib/types'
import { formatDzd, getCheckoutBlockMessage } from '@/lib/utils'
import { PaymentInstructions } from '@/components/PaymentInstructions'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormError } from '@/components/ui/FormError'

const schema = z.object({
  payer_name: z.string().min(2, 'Enter your full name'),
  payment_ref: z.string().min(3, 'Enter the transfer reference'),
})

type FormData = z.infer<typeof schema>

function SubscriptionCheckoutFormInner({ planId }: { planId: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const hasActiveSub =
    user?.is_beta ||
    user?.active_subscription?.status === 'active' ||
    user?.active_subscription?.status === 'beta'

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const res = await libraryApi.getPlans()
        if (cancelled) return
        const found = res.data.find((p) => p.id === Number(planId))
        setPlan(found ?? null)
      } finally {
        if (!cancelled) setLoadingPlan(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [planId])

  const onSubmit = async (data: FormData) => {
    if (!plan) return

    try {
      await subscriptionApi.create({
        plan_id: Number(planId),
        payer_name: data.payer_name,
        payment_ref: data.payment_ref,
      })
      setDone(true)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? getCheckoutBlockMessage(err.response?.data, 'Something went wrong')
        : 'Something went wrong'
      setError('root', { message })
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Request received!</h1>
        <p className="text-zinc-600 mb-6">
          Your subscription request is pending confirmation. You&apos;ll receive access within
          24 hours once payment is verified.
        </p>
        <Button onClick={() => router.push('/dashboard')}>Go to dashboard</Button>
      </div>
    )
  }

  if (loadingPlan) {
    return <div className="max-w-lg mx-auto px-4 py-16 text-zinc-500">Loading plan…</div>
  }

  if (!plan) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Plan not found</h1>
        <p className="text-zinc-600 mb-6">Pick a plan from the pricing page first.</p>
        <Link href="/pricing">
          <Button>View pricing</Button>
        </Link>
      </div>
    )
  }

  if (hasActiveSub) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Already subscribed</h1>
        <p className="text-zinc-600 mb-6">
          You already have full library access. No need to subscribe again.
        </p>
        <Link href="/dashboard">
          <Button>Go to library</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <Link href="/pricing" className="text-sm text-zinc-600 hover:text-zinc-900 mb-6 inline-block">
        ← Back to pricing
      </Link>

      <h1 className="text-2xl font-semibold text-zinc-900 mb-8">Complete your subscription</h1>

      <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-8">
        <p className="text-sm text-zinc-500 mb-1">Selected plan</p>
        <p className="font-semibold text-lg text-zinc-900">{plan.name}</p>
        <p className="text-2xl font-semibold text-zinc-900 mt-2">{formatDzd(plan.price_dzd)}</p>
      </div>

      <PaymentInstructions amountDzd={plan.price_dzd} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Your full name (as it appears on the transfer)"
          error={errors.payer_name?.message}
          {...register('payer_name')}
        />

        <Input
          label="Transfer reference number"
          error={errors.payment_ref?.message}
          {...register('payment_ref')}
        />

        <FormError message={errors.root?.message} />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting…' : 'Submit payment confirmation'}
        </Button>
      </form>
    </div>
  )
}

function SubscriptionCheckoutForm() {
  const searchParams = useSearchParams()
  const planId = searchParams.get('planId')

  if (!planId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Plan not found</h1>
        <p className="text-zinc-600 mb-6">Pick a plan from the pricing page first.</p>
        <Link href="/pricing">
          <Button>View pricing</Button>
        </Link>
      </div>
    )
  }

  return <SubscriptionCheckoutFormInner key={planId} planId={planId} />
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-16 text-zinc-500">Loading…</div>}>
      <SubscriptionCheckoutForm />
    </Suspense>
  )
}
