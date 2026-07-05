'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/Navbar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/auth')
  const isHome = pathname === '/'

  return (
    <div className={`min-h-screen ${isHome ? 'bg-[#07070a]' : 'bg-gray-50'} text-zinc-900`}>
      {!isAuthPage && !isHome && <Navbar />}
      {children}
    </div>
  )
}
