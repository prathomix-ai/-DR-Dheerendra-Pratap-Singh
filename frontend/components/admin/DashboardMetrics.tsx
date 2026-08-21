import { Activity, CalendarDays, BrainCircuit, type LucideIcon } from 'lucide-react'

export type DashboardMetric = {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
}

type DashboardMetricsProps = {
  metrics: DashboardMetric[]
}

export default function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {metrics.map(({ title, value, subtitle, icon: Icon }) => (
        <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
              <Icon size={18} />
            </div>
          </div>
          <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </article>
      ))}
    </section>
  )
}
