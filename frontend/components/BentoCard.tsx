'use client'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { ReactNode } from 'react'
interface Props { children: ReactNode; className?: string; span?: string; delay?: number; id?: string; onClick?: () => void; variant?: 'default'|'teal'|'dark'|'sage' }
export default function BentoCard({ children, className='', span='', delay=0, id, onClick, variant='default' }: Props) {
  const v = {
    default: 'bg-white/60 border border-white/40 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.07)]',
    teal: 'bg-white/60 border border-teal-200/30 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.07)]',
    dark: 'glass-dark',
    sage: 'bg-white/60 border border-emerald-200/30 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.07)]',
  }
  return (
    <motion.div id={id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay, ease:'easeOut' }}
      whileHover={{ y:-3, scale: 1.02, transition:{ duration:0.1 } }} whileTap={{ scale: 0.98, transition:{ duration:0.1 } }} onClick={onClick}
      className={clsx('rounded-3xl p-6 relative overflow-hidden transition-all duration-200', v[variant], span, className)}>
      <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(13,148,136,0.6),transparent)' }} />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  )
}
