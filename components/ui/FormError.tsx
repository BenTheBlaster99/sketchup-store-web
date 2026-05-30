interface FormErrorProps {
  message?: string
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null

  return <p className="text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-lg">{message}</p>
}
