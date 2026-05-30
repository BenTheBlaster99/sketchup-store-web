'use client'

import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
    is_student: z.boolean().optional(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormData = z.infer<typeof schema>

const fields = [
  { name: 'name' as const, label: 'Name', type: 'text', autoComplete: 'name' },
  { name: 'email' as const, label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'password' as const, label: 'Password', type: 'password', autoComplete: 'new-password' },
  {
    name: 'password_confirmation' as const,
    label: 'Password confirmation',
    type: 'password',
    autoComplete: 'new-password',
  },
]

function RegisterForm() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_student: false },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.register(data)
      await login(res.data.token)
      router.push(next?.startsWith('/') ? next : '/dashboard')
    } catch (err) {
      let message = 'Registration failed'
      if (axios.isAxiosError(err)) {
        const emailError = err.response?.data?.errors?.email?.[0]
        message =
          (emailError as string | undefined) ??
          (err.response?.data?.message as string | undefined) ??
          message
      }
      setError('root', { message })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md border border-zinc-200">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-6">Create your account</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium text-zinc-900 mb-1">
                {field.label}
              </label>
              <input
                {...register(field.name)}
                id={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
              {errors[field.name] && (
                <p className="text-red-600 text-sm mt-1">{errors[field.name]?.message}</p>
              )}
            </div>
          ))}

          <label className="flex items-center gap-2 text-sm cursor-pointer text-zinc-700">
            <input {...register('is_student')} type="checkbox" className="rounded" />
            I am a student (qualifies for student pricing)
          </label>

          <FormError message={errors.root?.message} />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-4">
          Already have an account?{' '}
          <Link
            href={next ? `/auth/login?next=${encodeURIComponent(next)}` : '/auth/login'}
            className="text-zinc-900 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-500">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  )
}
