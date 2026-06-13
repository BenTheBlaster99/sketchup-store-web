'use client'

import { useState } from 'react'
import axios from 'axios'
import { waitlistApi } from '@/lib/api'
import { Button } from '@/components/ui/Button'

type FormState = 'idle' | 'loading' | 'done' | 'exists' | 'error'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [state, setState] = useState<FormState>('idle')

  const handleSubmit = async () => {
    if (!email.trim()) return
    setState('loading')
    try {
      const res = await waitlistApi.join({
        email: email.trim(),
        name: name.trim() || undefined,
      })
      setState(res.data.already_joined ? 'exists' : 'done')
    } catch (err) {
      setState('idle')
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setState('error')
      }
    }
  }

  if (state === 'done') {
    return (
      <section className="py-16 bg-zinc-100 border-y border-zinc-200">
        <div className="max-w-xl mx-auto px-4 text-center">
          <p className="text-2xl font-semibold text-zinc-900 mb-2">You&apos;re on the list ✓</p>
          <p className="text-zinc-600">
            We&apos;ll email you the moment the library is fully stocked with real models.
          </p>
        </div>
      </section>
    )
  }

  if (state === 'exists') {
    return (
      <section className="py-16 bg-zinc-100 border-y border-zinc-200">
        <div className="max-w-xl mx-auto px-4 text-center">
          <p className="text-zinc-600">
            You&apos;re already on the waitlist. We&apos;ll be in touch soon.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-zinc-100 border-y border-zinc-200">
      <div className="max-w-xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-semibold text-zinc-900 mb-3">Get early access</h2>
        <p className="text-zinc-600 mb-8">
          More models are on the way. Join the waitlist and be the first to know when
          Sarah&apos;s full library is ready to browse.
        </p>

        <div className="flex flex-col gap-3 text-left">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="flex-1 border border-zinc-300 rounded-xl px-4 py-3 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={state === 'loading' || !email.trim()}
              className="whitespace-nowrap px-6"
            >
              {state === 'loading' ? 'Joining…' : 'Join waitlist'}
            </Button>
          </div>
        </div>

        {state === 'error' && (
          <p className="text-sm text-red-600 mt-3">Please enter a valid email address.</p>
        )}

        <p className="text-xs text-zinc-400 mt-3">No spam. One email when we launch.</p>
      </div>
    </section>
  )
}
