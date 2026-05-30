'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Link from 'next/link'
import { libraryApi, packApi } from '@/lib/api'
import type { Category } from '@/lib/types'
import { formatDzd, getPackBlockMessage } from '@/lib/utils'
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

function PackCheckoutContent({ categoryId }: { categoryId: string }) {
  const router = useRouter()
  const { packCategoryIds } = useAuth()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const alreadyOwns = packCategoryIds.includes(Number(categoryId))

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const res = await libraryApi.getCategories()
        if (cancelled) return
        const found = res.data.find((c) => c.id === Number(categoryId))
        setCategory(found ?? null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [categoryId])

  const onSubmit = async (data: FormData) => {
    try {
      await packApi.purchase(Number(categoryId), data)
      setDone(true)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? getPackBlockMessage(err.response?.data, 'Something went wrong')
        : 'Something went wrong'
      setError('root', { message })
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Pack request received!</h1>
        <p className="text-zinc-600 mb-6">
          You&apos;ll get access within 24 hours once payment is verified.
        </p>
        <Button onClick={() => router.push('/dashboard')}>Go to dashboard</Button>
      </div>
    )
  }

  if (loading) {
    return <div className="max-w-lg mx-auto px-4 py-16 text-zinc-500">Loading…</div>
  }

  if (!category?.pack) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Category not found</h1>
        <p className="text-zinc-600 mb-6">This category pack is not available.</p>
        <Link href="/dashboard">
          <Button>Back to library</Button>
        </Link>
      </div>
    )
  }

  if (alreadyOwns) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Already purchased</h1>
        <p className="text-zinc-600 mb-6">You already have access to {category.name}.</p>
        <Link href={`/dashboard/${category.slug}`}>
          <Button>Browse {category.name}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900 mb-6 inline-block">
        ← Back to library
      </Link>

      <h1 className="text-2xl font-semibold text-zinc-900 mb-8">Buy category pack</h1>

      <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-8">
        <p className="text-sm text-zinc-500 mb-1">{category.name}</p>
        <p className="text-2xl font-semibold text-zinc-900">{formatDzd(category.pack.price_dzd)}</p>
        <p className="text-sm text-zinc-500 mt-1">One-time purchase · lifetime access</p>
      </div>

      <PaymentInstructions amountDzd={category.pack.price_dzd} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Your full name" error={errors.payer_name?.message} {...register('payer_name')} />
        <Input
          label="Transfer reference"
          error={errors.payment_ref?.message}
          {...register('payment_ref')}
        />

        <FormError message={errors.root?.message} />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting…' : 'Confirm purchase'}
        </Button>
      </form>
    </div>
  )
}

export default function PackCheckoutPage() {
  const { categoryId } = useParams<{ categoryId: string }>()

  if (!categoryId) {
    return null
  }

  return <PackCheckoutContent key={categoryId} categoryId={categoryId} />
}
