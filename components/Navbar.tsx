'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
  const { user, logout, isLoading } = useAuth()

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold text-lg text-zinc-900 shrink-0">
          SketchLib
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/pricing" className="text-zinc-700 hover:text-zinc-900">
            Pricing
          </Link>

          {isLoading ? (
            <div className="flex items-center gap-4" aria-hidden>
              <span className="h-4 w-14 bg-zinc-100 rounded" />
              <span className="h-9 w-20 bg-zinc-100 rounded-lg" />
            </div>
          ) : user ? (
            <>
              <Link href="/dashboard" className="text-zinc-700 hover:text-zinc-900">
                Library
              </Link>
              <span className="hidden sm:inline text-zinc-500">{user.name}</span>
              <button
                type="button"
                onClick={() => logout()}
                className="text-zinc-700 hover:text-zinc-900"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-zinc-700 hover:text-zinc-900">
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
