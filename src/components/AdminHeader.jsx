export default function AdminHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between px-6 py-5 bg-white border-b border-border sticky top-0 z-10">
      <div>
        <h1 className="text-primary text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-muted text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  )
}
