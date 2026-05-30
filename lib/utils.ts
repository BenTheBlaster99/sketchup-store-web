export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function formatDzd(amount: number): string {
  return `${amount.toLocaleString()} DZD`
}

export function formatFileSize(bytes: number): string {
  return `${(bytes / 1_000_000).toFixed(1)} MB`
}

interface ApiErrorBody {
  message?: string
  existing_status?: string
}

export function getCheckoutBlockMessage(data: ApiErrorBody | undefined, fallback: string): string {
  if (!data?.message) return fallback

  const status = data.existing_status
  if (status === 'active' || status === 'beta') {
    return 'You already have an active subscription. Go to the library to browse models.'
  }
  if (status === 'pending') {
    return 'You already submitted a payment — waiting for admin approval.'
  }
  if (status === 'rejected') {
    return data.message
  }

  return data.message
}

export function getPackBlockMessage(data: ApiErrorBody | undefined, fallback: string): string {
  if (!data?.message) return fallback

  const status = data.existing_status
  if (status === 'active') {
    return 'You already own this category pack.'
  }
  if (status === 'pending') {
    return 'You already submitted payment for this pack — waiting for approval.'
  }

  return data.message
}

/** Trigger browser download for presigned cross-origin URLs (fallback opens new tab). */
export function triggerFileDownload(url: string, filename: string): void {
  const safeName = filename.endsWith('.skp') ? filename : `${filename}.skp`

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = safeName
  anchor.rel = 'noopener'
  anchor.target = '_blank'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}
