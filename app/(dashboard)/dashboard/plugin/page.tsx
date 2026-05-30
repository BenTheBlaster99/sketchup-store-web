'use client'

import { useAuth } from '@/context/AuthContext'
import { PLUGIN_DOWNLOAD_URL, PLUGIN_VERSION } from '@/lib/plugin'

const steps = [
  {
    title: 'Download & unzip',
    body: 'Download the plugin below and extract the .zip file.',
  },
  {
    title: 'Open the SketchUp Plugins folder',
    body: 'In SketchUp: Window → Preferences → Extensions → Install Extension is NOT used here. Instead copy the files into your Plugins folder (path below).',
  },
  {
    title: 'Copy the files',
    body: 'Put load_sketchlib.rb and the sketchlib-plugin folder into the Plugins folder.',
  },
  {
    title: 'Restart & open',
    body: 'Restart SketchUp, start a new model, then open Extensions → SketchLib and sign in with this account.',
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
              {PLUGIN_VERSION} · Windows &amp; macOS · SketchUp 2024+
            </p>
          </div>
          <a
            href={PLUGIN_DOWNLOAD_URL}
            className="bg-zinc-900 text-white px-5 py-3 rounded-xl hover:bg-zinc-800 transition font-medium"
          >
            Download plugin (.zip)
          </a>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Install in 4 steps</h2>
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

      <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
        <p className="font-medium text-zinc-900 mb-1">Plugins folder location</p>
        <p className="font-mono text-xs break-all">
          Windows: %APPDATA%\SketchUp\SketchUp 2026\SketchUp\Plugins\
        </p>
        <p className="font-mono text-xs break-all mt-1">
          macOS: ~/Library/Application Support/SketchUp 2026/SketchUp/Plugins/
        </p>
        <p className="mt-2 text-zinc-500">
          One computer per account. Sign in with the same email and password you use here.
        </p>
      </div>
    </div>
  )
}
