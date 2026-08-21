import AdminSidebarClient from '../../components/admin/AdminSidebarClient'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_22%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_20%),linear-gradient(180deg,#f8fafc_0%,#f8fafc_100%)] text-slate-900">
			<div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
				<AdminSidebarClient />

				<main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
			</div>
		</div>
	)
}
