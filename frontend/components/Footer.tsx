'use client'
import Link from 'next/link'
import { Activity, Heart, Shield, Zap, Phone, Mail, MapPin, AlertTriangle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative glass-dark text-white mt-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-teal">
                <Activity size={22} className="text-white" />
              </div>
              <div>
                <div className="font-display font-800 text-xl text-white">Prathomix</div>
                <div className="font-mono text-[11px] text-teal-400 tracking-widest uppercase">AI Physiotherapy</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-body">
              Revolutionizing physiotherapy with empathetic AI, real-time pose correction, and multi-language support across India.
            </p>
            <div className="mt-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="font-mono text-[10px] text-amber-300 leading-snug">
                  DISCLAIMER: Prathomix AI holds ZERO legal or medical liability. This is an AI-assistive tool. Users assume 100% risk.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Zap size={13} className="text-teal-500" />
              <span className="font-mono text-xs text-teal-400 font-600 tracking-wider uppercase">Powered by Prathomix</span>
            </div>
          </div>
          <div>
            <h4 className="font-display font-700 text-white mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <div className="flex flex-col gap-2">
              {[{href:'/',label:'Home'},{href:'/about',label:'About & Features'},{href:'/ai-triage',label:'AI Triage'},{href:'/appointments',label:'Book Appointment'},{href:'/dashboard',label:'My Dashboard'},{href:'/settings',label:'Settings'}].map(({href,label})=>(
                <Link key={href} href={href} className="text-slate-400 hover:text-teal-400 text-sm font-body transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-700 text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5"><MapPin size={14} className="text-teal-500 mt-0.5 shrink-0" /><span className="text-slate-400 text-sm font-body leading-snug">Prathomix Physio Clinic<br/>New Delhi, India — 110001</span></div>
              <div className="flex items-center gap-2.5"><Phone size={14} className="text-teal-500 shrink-0" /><span className="text-slate-400 text-sm font-body">+91 99999 99999</span></div>
              <div className="flex items-center gap-2.5"><Mail size={14} className="text-teal-500 shrink-0" /><span className="text-slate-400 text-sm font-body">care@prathomix.in</span></div>
            </div>
            <div className="mt-5 flex items-center gap-2"><Shield size={13} className="text-teal-500" /><span className="text-slate-500 text-xs font-body">HIPAA · DPDP · ISO 27001</span></div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs font-body">© 2026 Dr. Dheerendra Pratap Singh. Powered by Prathomix AI.</p>
          <div className="flex items-center gap-1.5">
            <Heart size={12} className="text-red-500" />
            <span className="text-slate-500 text-xs font-body">Built with care for India&apos;s health</span>
          </div>
          <div className="flex items-center gap-3">
            {['Privacy','Terms','Refund','Disclaimer'].map(l=>(
              <Link key={l} href={`/${l.toLowerCase()}`} className="text-slate-500 hover:text-teal-400 text-xs font-body transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}