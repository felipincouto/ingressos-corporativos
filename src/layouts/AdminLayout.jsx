import { useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Upload, List, Printer, PackageCheck,
  QrCode, BarChart3, LogOut, Ticket, Trophy, CalendarDays
} from 'lucide-react'
import clsx from 'clsx'
import { useApp } from '../context/AppContext'

const NAV = [
  { to: '/admin/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/admin/importacao', label: 'Importação',   icon: Upload },
  { to: '/admin/pedidos',    label: 'Pedidos',      icon: List },
  { to: '/admin/impressao',  label: 'Impressão',    icon: Printer },
  { to: '/admin/retirada',   label: 'Retirada',     icon: PackageCheck },
  { to: '/admin/checkin',    label: 'Check-in',     icon: QrCode },
  { to: '/admin/evento',     label: 'Evento',       icon: CalendarDays },
  { to: '/admin/relatorios', label: 'Relatórios',   icon: BarChart3 },
  { to: '/admin/sorteio',    label: 'Sorteio',      icon: Trophy },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { adminUser, adminLogout } = useApp()

  useEffect(() => {
    if (!adminUser) {
      navigate('/admin/login', { replace: true })
    }
  }, [adminUser])

  function handleLogout() {
    adminLogout()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-primary flex flex-col shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <div className="bg-accent rounded-lg p-1.5">
            <Ticket size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm leading-tight">
            Ingressos<br />
            <span className="text-white/60 font-normal text-xs">Corporativos</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-white/50 hover:text-white hover:bg-white/10 text-sm transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
