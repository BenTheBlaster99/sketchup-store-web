import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-zinc-900 mb-1">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          'w-full border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-zinc-900',
          className,
        )}
        {...props}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  )
}
