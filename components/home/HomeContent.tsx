import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { WaitlistForm } from '@/components/WaitlistForm'
import { getAdminPanelUrl } from '@/lib/utils'

export function HomeContent() {
  const adminUrl = getAdminPanelUrl()

  return (
    <div className="bg-gray-50 text-zinc-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 mb-4">
          3D furniture models for SketchUp
        </h1>
        <p className="text-lg text-zinc-600 mb-10 max-w-2xl">
          Browse curated .skp models by category. Subscribe for full library access or buy
          individual category packs — one payment, lifetime access per pack.
        </p>

        <div className="flex flex-wrap gap-3 mb-16">
          <Link
            href="/auth/register"
            className="bg-zinc-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition"
          >
            Get started
          </Link>
          <Link
            href="/pricing"
            className="border border-zinc-300 bg-white text-zinc-900 px-6 py-2.5 rounded-lg font-medium hover:bg-zinc-50 transition"
          >
            View pricing
          </Link>
        </div>

        <section className="grid sm:grid-cols-3 gap-6 mb-16">
          {[
            {
              title: 'Browse by category',
              body: 'Living room, kitchen, bedroom — organized libraries ready for your projects.',
            },
            {
              title: 'Subscribe or buy packs',
              body: 'Monthly/yearly plans for everything, or a one-time pack for one category.',
            },
            {
              title: 'Download .skp files',
              body: 'Get models straight into SketchUp. Thumbnails and file sizes shown upfront.',
            },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-zinc-200 rounded-2xl p-5">
              <h2 className="font-medium text-zinc-900 mb-2">{item.title}</h2>
              <p className="text-sm text-zinc-600">{item.body}</p>
            </div>
          ))}
        </section>

        <WaitlistForm />

        <p className="text-xs text-zinc-400 px-4 pb-16">
          Staff admin panel:{' '}
          <a
            href={adminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-600 underline hover:text-zinc-900"
          >
            Filament dashboard →
          </a>
        </p>
      </main>
    </div>
  )
}
