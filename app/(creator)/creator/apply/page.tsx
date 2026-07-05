'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { creatorApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { CreatorApplication } from '@/lib/types'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  bio: z.string().min(50, 'Tell us a bit more (min 50 characters)'),
  portfolio_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  paypal_email: z.string().email('Enter your PayPal email'),
})

type FormData = z.infer<typeof schema>

export default function CreatorApplyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [existing, setExisting] = useState<CreatorApplication | null>(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    void creatorApi
      .appStatus()
      .then((res) => setExisting(res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (user?.creator_status === 'approved') {
      router.push('/creator')
    }
  }, [user, router])

  const onSubmit = async (data: FormData) => {
    try {
      await creatorApi.apply({
        bio: data.bio,
        paypal_email: data.paypal_email,
        portfolio_url: data.portfolio_url || undefined,
      })
      setDone(true)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? ((err.response?.data?.message as string | undefined) ?? 'Something went wrong')
        : 'Something went wrong'
      setError('root', { message })
    }
  }

  if (user?.creator_status === 'approved') {
    return null
  }

  if (done || existing?.status === 'pending') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Application submitted</h1>
        <p className="text-zinc-500">
          Sarah will review your application and get back to you soon.
        </p>
      </div>
    )
  }

  if (existing?.status === 'rejected') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Application not approved</h1>
        <p className="text-zinc-500">Contact us for more information.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Become a creator</h1>
      <p className="text-zinc-500 mb-8">
        Upload your SketchUp furniture models to SketchLib and earn a share of subscription
        revenue based on downloads.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-900 mb-1">
            Tell us about yourself and your work
          </label>
          <textarea
            {...register('bio')}
            rows={4}
            placeholder="I'm a 3D designer specializing in..."
            className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm text-zinc-900 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          {errors.bio && <p className="text-red-600 text-sm mt-1">{errors.bio.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-900 mb-1">
            Portfolio URL <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <input
            {...register('portfolio_url')}
            type="url"
            placeholder="https://yourportfolio.com"
            className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          {errors.portfolio_url && (
            <p className="text-red-600 text-sm mt-1">{errors.portfolio_url.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-900 mb-1">
            PayPal email for payouts
          </label>
          <input
            {...register('paypal_email')}
            type="email"
            placeholder="yourpaypal@email.com"
            className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          {errors.paypal_email && (
            <p className="text-red-600 text-sm mt-1">{errors.paypal_email.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{errors.root.message}</p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting…' : 'Submit application'}
        </Button>
      </form>
    </div>
  )
}
