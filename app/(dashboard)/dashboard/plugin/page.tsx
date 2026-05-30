'use client'

import { useAuth } from '@/context/AuthContext'
import { PLUGIN_DOWNLOAD_URL, PLUGIN_VERSION } from '@/lib/plugin'

const steps = [
  {
    title: 'Download the plugin',
    body: 'Click the button below to download the .rbz file (one file, no zip to extract).',
  },
  {
    title: 'Install in SketchUp',
    body: 'Window → Preferences → Extensions → Install Extension… → choose the .rbz file.',
  },
  {
    title: 'Allow unsigned extensions',
    body: 'If prompted, approve the install or set Extension Manager loading to Unrestricted.',
  },
  {
    title: 'Open SketchLib',
    body: 'Start a model → Extensions → SketchLib → sign in with this account.',
  },
]

export default function PluginPage() {
  const { user } = useAuth()

  const hasAccess =
    user?.is_beta ||
    user?.active_subscription?.status === 'active' ||
    user?.active_subscription?.status === 'beta'

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900">SketchUp Plugin</h1>
      <p className="text-sm text-zinc-500 mt-1">
        Browse and insert your models directly inside SketchUp.
      </p>

      {!hasAccess && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You can install the plugin now, but you&apos;ll need an active subscription or a
          category pack to insert models.
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-medium text-zinc-900">SketchLib Plugin</p>
            <p className="text-sm text-zinc-500">
              {PLUGIN_VERSION} · Windows &amp; macOS · SketchUp 2020–2026
            </p>
          </div>
          <a
            href={PLUGIN_DOWNLOAD_URL}
            className="bg-zinc-900 text-white px-5 py-3 rounded-xl hover:bg-zinc-800 transition font-medium"
          >
            Download plugin (.rbz)
          </a>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Install in 4 steps (one-click)</h2>
        <ol className="space-y-4">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-zinc-900 text-white text-sm flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-zinc-900">{step.title}</p>
                <p className="text-sm text-zinc-600">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-8 text-sm text-zinc-500">
        One computer per account. Sign in with the same email and password you use here.
      </p>
    </div>
  )
}
