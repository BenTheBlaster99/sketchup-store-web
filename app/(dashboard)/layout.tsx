import { Navbar } from '@/components/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-zinc-900">
      <Navbar />
      {children}
    </div>
  )
}
