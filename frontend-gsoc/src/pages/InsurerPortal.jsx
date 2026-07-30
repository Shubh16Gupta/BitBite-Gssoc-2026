/** Shell for the insurance provider portal. */
import { Link, Outlet } from 'react-router-dom'
import { ShieldCheck, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function InsurerPortal() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="container-custom px-6 md:px-8 mx-auto flex h-16 items-center justify-between">
          <Link to="/insurer" className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 grid place-items-center shadow-lg">
              <ShieldCheck className="h-5 w-5 text-white" />
            </span>
            <span className="text-base font-bold text-slate-900">AnnData</span>
            <span className="ml-1 rounded-md border border-teal-200 bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-700">
              insurance portal
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user?.companyName && (
              <span className="hidden sm:inline text-sm text-slate-500">
                {user.companyName}
                {user.branchName ? ` · ${user.branchName}` : ''}
              </span>
            )}
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:text-red-600 transition"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>
      </header>

      <main className="container-custom px-6 md:px-8 mx-auto py-8">
        <Outlet />
      </main>
    </div>
  )
}
