'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const PORTAL_LINKS = [
  { href: '/creator', label: 'Dashboard' },
  { href: '/creator/upload', label: 'Upload model' },
  { href: '/creator/earnings', label: 'Earnings' },
  { href: '/dashboard', label: '← Back to library' },
]

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isApplyPage = pathname === '/creator/apply'

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push('/auth/login?next=/creator')
      return
    }
    if (isApplyPage) return
    if (user.creator_status === 'none' || user.creator_status === 'pending') {
      router.push('/creator/apply')
      return
    }
    if (user.creator_status === 'suspended') {
      router.push('/dashboard')
    }
  }, [user, isLoading, isApplyPage, router])

  if (isLoading || !user) {
    return null
  }

  if (isApplyPage) {
    return <>{children}</>
  }

  if (user.creator_status !== 'approved') {
    return null
  }

  return (
    <div className="flex min-h-[calc(100vh-65px)]">
      <aside className="w-52 border-r border-zinc-200 bg-white p-6 space-y-1 shrink-0">
        <p className="text-xs text-zinc-400 uppercase tracking-wider mb-4">Creator</p>
        {PORTAL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 rounded-lg text-sm transition ${
              pathname === link.href
                ? 'bg-zinc-100 text-zinc-900 font-medium'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
