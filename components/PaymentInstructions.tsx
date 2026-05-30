import { formatDzd } from '@/lib/utils'

interface PaymentInstructionsProps {
  amountDzd: number
}

export function PaymentInstructions({ amountDzd }: PaymentInstructionsProps) {
  const account = process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT ?? '—'

  return (
    <div className="border border-dashed border-zinc-300 rounded-2xl p-6 mb-8 space-y-2 bg-white">
      <p className="font-medium text-zinc-900 mb-3">How to pay</p>
      <p className="text-sm text-zinc-600">
        1. Open your BaridiMob app or CCP account.
      </p>
      <p className="text-sm text-zinc-600">
        2. Transfer <strong className="text-zinc-900">{formatDzd(amountDzd)}</strong> to:
      </p>
      <p className="font-mono text-lg font-semibold text-zinc-900 text-center py-2 break-all">
        {account}
      </p>
      <p className="text-sm text-zinc-600">
        3. Copy your transfer reference number and enter it below.
      </p>
      <p className="text-xs text-zinc-400 pt-1">
        Payment is verified manually — access is granted within 24 hours.
      </p>
    </div>
  )
}
