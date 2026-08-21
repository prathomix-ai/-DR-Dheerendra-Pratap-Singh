type UpcomingAppointment = {
  id: string
  patientName: string
  time: string
  sessionType: string
}

type UpcomingAppointmentsCardProps = {
  appointments: UpcomingAppointment[]
}

export default function UpcomingAppointmentsCard({ appointments }: UpcomingAppointmentsCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Upcoming appointments</h2>
          <p className="mt-1 text-sm text-slate-500">Today’s clinical schedule at a glance.</p>
        </div>
        <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
          Live agenda
        </span>
      </div>

      <div className="space-y-3">
        {appointments.map((appointment) => (
          <article key={appointment.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-white">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{appointment.patientName}</p>
              <p className="text-sm text-slate-500">{appointment.sessionType}</p>
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
              {appointment.time}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
