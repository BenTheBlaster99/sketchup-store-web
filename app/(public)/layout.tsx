'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/Navbar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/auth')

  return (
    <div className="min-h-screen bg-gray-50 text-zinc-900">
      {!isAuthPage && <Navbar />}
      {children}
    </div>
  )
}
