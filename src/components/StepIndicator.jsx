import clsx from 'clsx'
import { Check } from 'lucide-react'

export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const idx = i + 1
        const done = idx < current
        const active = idx === current

        return (
          <div key={label} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                done   && 'bg-success text-white',
                active && 'bg-primary text-white ring-4 ring-primary/20',
                !done && !active && 'bg-border text-muted'
              )}>
                {done ? <Check size={13} /> : idx}
              </div>
              <span className={clsx(
                'text-xs mt-1 font-medium hidden sm:block whitespace-nowrap',
                active ? 'text-primary' : done ? 'text-success' : 'text-muted'
              )}>
                {label}
              </span>
            </div>

            {/* Connector */}
            {i < steps.length - 1 && (
              <div className={clsx(
                'h-0.5 w-10 sm:w-16 mx-1 mb-4 rounded transition-all',
                done ? 'bg-success' : 'bg-border'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
