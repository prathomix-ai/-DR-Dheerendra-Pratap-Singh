type AnalyticsCardProps = {
  patientName: string
  poseAccuracy: number
  jointMobility: number
  painProgress: number
}

function ProgressBar({ value, tone }: { value: number; tone: 'teal' | 'blue' | 'emerald' }) {
  const trackStyles = {
    teal: 'bg-teal-100',
    blue: 'bg-blue-100',
    emerald: 'bg-emerald-100',
  }

  const fillStyles = {
    teal: 'bg-teal-600',
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
  }

  return (
    <div className={`h-2.5 overflow-hidden rounded-full ${trackStyles[tone]}`}>
      <div className={`h-full rounded-full ${fillStyles[tone]}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

export default function AnalyticsCard({ patientName, poseAccuracy, jointMobility, painProgress }: AnalyticsCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">AI analytics</h2>
          <p className="mt-1 text-sm text-slate-500">Clinical performance snapshot for {patientName}.</p>
        </div>
        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
          AI report viewer
        </span>
      </div>

      <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Pose accuracy %</span>
            <span className="font-semibold text-slate-900">{poseAccuracy}%</span>
          </div>
          <ProgressBar value={poseAccuracy} tone="teal" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Joint mobility score</span>
            <span className="font-semibold text-slate-900">{jointMobility}/100</span>
          </div>
          <ProgressBar value={jointMobility} tone="blue" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Pain level progress</span>
            <span className="font-semibold text-slate-900">{painProgress}% improved</span>
          </div>
          <ProgressBar value={painProgress} tone="emerald" />
        </div>
      </div>
    </section>
  )
}
