import { useNavigate } from 'react-router-dom'
import { Ticket, LogOut } from 'lucide-react'
import StepIndicator from '../components/StepIndicator'
import { useApp } from '../context/AppContext'

const STEPS = ['Quantidade', 'Participantes', 'Termos', 'Confirmação']

export default function EmployeeLayout({ children, step, showSteps = true }) {
  const navigate = useNavigate()
  const { logout } = useApp()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <Ticket size={16} className="text-white" />
            </div>
            <span className="font-bold text-primary text-sm">Ingressos Corporativos</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-muted hover:text-primary text-xs font-medium transition-colors"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>

        {/* Steps */}
        {showSteps && (
          <div className="max-w-2xl mx-auto px-4 py-3 flex justify-center border-t border-border">
            <StepIndicator steps={STEPS} current={step} />
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  )
}
