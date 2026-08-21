type QuickActionBarProps = {
  onAddPatient?: () => void
  onUploadPrescription?: () => void
  onScheduleFollowUp?: () => void
}

function ActionButton({
  label,
  onClick,
  tone,
}: {
  label: string
  onClick?: () => void
  tone: 'teal' | 'slate' | 'blue'
}) {
  const styles = {
    teal: 'bg-teal-600 text-white hover:bg-teal-700',
    slate: 'bg-slate-900 text-white hover:bg-slate-800',
    blue: 'bg-blue-600 text-white hover:bg-blue-700',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition ${styles[tone]}`}
    >
      {label}
    </button>
  )
}

export default function QuickActionBar({ onAddPatient, onUploadPrescription, onScheduleFollowUp }: QuickActionBarProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-slate-900">Quick clinical actions</h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <ActionButton label="Add New Patient" onClick={onAddPatient} tone="teal" />
        <ActionButton label="Upload Prescription (OCR)" onClick={onUploadPrescription} tone="slate" />
        <ActionButton label="Schedule Follow-up" onClick={onScheduleFollowUp} tone="blue" />
      </div>
    </section>
  )
}
