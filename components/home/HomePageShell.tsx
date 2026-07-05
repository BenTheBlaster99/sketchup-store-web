'use client'

import dynamic from 'next/dynamic'
import { HomeContent } from '@/components/home/HomeContent'

const VaultHero = dynamic(() => import('@/components/vault-ultimate/VaultHero'), {
  ssr: false,
  loading: () => (
    <section
      className="flex min-h-screen items-center justify-center bg-[#07070a] text-zinc-400"
      aria-label="Loading vault intro"
    >
      Loading vault…
    </section>
  ),
})

export function HomePageShell() {
  return (
    <>
      <VaultHero />
      <HomeContent />
    </>
  )
}
