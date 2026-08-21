'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, CheckCircle2, Phone, MessageCircle, Video, ChevronRight, MapPin } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingActions from '@/components/FloatingActions'
import { isSupabaseConfigured, supabase, getStoredUser } from '@/lib/auth'
import { type Lang } from '@/lib/i18n'
import toast from 'react-hot-toast'

const CLINIC_FEE = 300
const SLOTS=['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM','05:30 PM']
const MODES=[
  {id:'in-clinic',icon:MapPin,label:'In-Clinic',desc:'Visit Prathomix Clinic, New Delhi',price:'₹300'},
  {id:'video',icon:Video,label:'Video Call',desc:'Secure Prathomix video session',price:'₹600'},
  {id:'home',icon:MessageCircle,label:'Home Visit',desc:'Dr. Dheerendra Pratap Singh  visits your location',price:'₹1400'}
]

function fmt(d:Date){return d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}
function nextDays(n:number){return Array.from({length:n},(_,i)=>{const d=new Date();d.setDate(d.getDate()+i);return d})}

export default function AppointmentsPage(){
  const [lang,setLang]=useState<Lang>('en'),
        [step,setStep]=useState(1),
        [mode,setMode]=useState('in-clinic'),
        [selDate,setSelDate]=useState<Date|null>(null),
        [selSlot,setSelSlot]=useState<string|null>(null),
        [name,setName]=useState(''),
        [phone,setPhone]=useState(''),
        [note,setNote]=useState(''),
        [submitting,setSubmitting]=useState(false),
        [booked,setBooked]=useState(false),
        [bookedSlots,setBookedSlots]=useState<string[]>([]),
        [loading,setLoading]=useState(false)

  const days=nextDays(14)
  const selectedMode = MODES.find((item) => item.id === mode)
  const consultationFee = mode === 'in-clinic' ? CLINIC_FEE : 0

  useEffect(()=>{
    if(!selDate){
      setBookedSlots([])
      setLoading(false)
      return
    }

    if (!isSupabaseConfigured) {
      setBookedSlots([])
      setLoading(false)
      return
    }

    const fetchSlots=async()=>{
      setLoading(true)
      try{
        const localDateString = new Date(selDate.getTime() - (selDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
        
        const {data,error}=await supabase
          .from('appointments')
          .select('appointment_time')
          .eq('appointment_date', localDateString)

        if(error){
          setBookedSlots([])
          return
        }
        setBookedSlots((data||[]).map((s:any)=>s.appointment_time))
      }catch{
        setBookedSlots([])
      }finally{
        setLoading(false)
      }
    }

    fetchSlots()
  },[selDate])

  const submit=async()=>{
    if(!selDate||!selSlot||!name||!phone){toast.error('Fill all required fields');return}
    if (mode === 'in-clinic' && selectedMode?.price !== `₹${CLINIC_FEE}`) {
      toast.error('Booking failed')
      return
    }
    
    setSubmitting(true)
    try{
      const user = getStoredUser()
      
      const localDate = new Date(selDate.getTime() - (selDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

      // Doctor ID ka chakkar hata diya gaya hai!
      const bookingPayload = {
        patient_id:       user?.id || null,
        patient_name:     name,
        phone:            phone,
        appointment_date: localDate,
        appointment_time: selSlot,
        pain_description: note || '',
        fee_amount:       consultationFee,
        status:           'pending'
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert([bookingPayload] as any)
        .select()
        .single()

      if (error || !data) {
        console.error('SUPABASE BOOKING ERROR FULL:', error)
        toast.error(error?.message || 'Booking failed due to an unknown error.')
        return
      }

      setBooked(true)
      setStep(5)
      
    } catch (error: any) {
      console.error('SUPABASE BOOKING ERROR FULL:', error)
      toast.error(error?.message || 'Booking failed due to an unknown error.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mesh-bg min-h-screen">
      <Navbar lang={lang} setLang={setLang}/>
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-28 md:pb-16">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-8 text-center">
          <h1 className="font-display font-900 text-4xl text-slate-900 mb-2">Book an <span className="text-gradient-teal">Appointment</span></h1>
          <p className="font-body text-slate-500">With Dr. Dheerendra Pratap Singh  · WhatsApp confirmation sent instantly</p>
        </motion.div>
        
        {!booked&&<div className="flex items-center gap-2 mb-8">{[1,2,3,4].map(s=>(
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-700 transition-all ${step>s?'bg-teal-500 text-white':step===s?'bg-teal-100 text-teal-700 border-2 border-teal-500':'bg-slate-100 text-slate-400'}`}>{step>s?<CheckCircle2 size={14}/>:s}</div>
            {s<4&&<div className={`flex-1 h-0.5 rounded-full transition-colors ${step>s?'bg-teal-500':'bg-slate-200'}`}/>}
          </div>
        ))}</div>}
        
        <AnimatePresence mode="wait">
          {step===1&&<motion.div key="s1" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
            <div className="glass rounded-2xl p-6 mb-4">
              <h2 className="font-display font-800 text-xl mb-5">Choose Type</h2>
              <div className="flex flex-col gap-3">{MODES.map(m=>(
                <button key={m.id} onClick={()=>setMode(m.id)} className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${mode===m.id?'border-teal-500 bg-teal-50/80':'border-slate-100 glass hover:border-teal-200'}`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${mode===m.id?'bg-teal-500':'bg-slate-100'}`}><m.icon size={20} className={mode===m.id?'text-white':'text-slate-500'}/></div>
                  <div className="flex-1"><div className="flex items-center justify-between"><span className="font-display font-700">{m.label}</span><span className="font-mono font-800 text-teal-700">{m.price}</span></div><p className="font-body text-sm text-slate-500">{m.desc}</p></div>
                  {mode===m.id&&<CheckCircle2 size={18} className="text-teal-500 shrink-0"/>}
                </button>
              ))}</div>
            </div>
            <button onClick={()=>setStep(2)} className="w-full btn-teal py-3.5 rounded-2xl font-700 text-base flex items-center justify-center gap-2">Continue<ChevronRight size={18}/></button>
          </motion.div>}
          
          {step===2&&<motion.div key="s2" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
            <div className="glass rounded-2xl p-6 mb-4">
              <h2 className="font-display font-800 text-xl mb-5">Select Date</h2>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">{days.map((d,i)=>{const isSel=selDate?.toDateString()===d.toDateString(),isWe=d.getDay()===0||d.getDay()===6;return(
                <button key={i} onClick={()=>{if(!isWe)setSelDate(d)}} disabled={isWe} className={`flex flex-col items-center p-1 sm:p-2 rounded-xl transition-all disabled:opacity-30 ${isSel?'bg-teal-500 text-white shadow-teal':i===0?'bg-teal-50 border border-teal-400 text-teal-700':'glass hover:border-teal-200 text-slate-700'}`}>
                  <span className="font-mono text-[9px] sm:text-[10px] font-600 uppercase">{d.toLocaleDateString('en',{weekday:'short'}).slice(0,2)}</span>
                  <span className="font-display font-800 text-base sm:text-lg leading-tight">{d.getDate()}</span>
                  {i===0&&<span className="font-mono text-[7px] sm:text-[8px] text-teal-600 font-bold">TODAY</span>}
                </button>
              )})}
              </div>
            </div>
            <div className="flex gap-3"><button onClick={()=>setStep(1)} className="flex-1 btn-glass border border-slate-200 py-3 rounded-2xl font-700 text-slate-700">← Back</button><button onClick={()=>selDate&&setStep(3)} disabled={!selDate} className="flex-1 btn-teal py-3 rounded-2xl font-700 disabled:opacity-40 flex items-center justify-center gap-2">Continue<ChevronRight size={18}/></button></div>
          </motion.div>}
          
          {step===3&&<motion.div key="s3" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
            <div className="glass rounded-2xl p-6 mb-4">
              <h2 className="font-display font-800 text-xl mb-1">Select Time</h2>
              <p className="font-body text-sm text-slate-500 mb-5">{selDate&&fmt(selDate)} · Dr. Dheerendra Pratap Singh </p>
              {loading && (
                <div className="flex flex-col gap-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="glass rounded-2xl p-4 shimmer h-24" />
                  ))}
                </div>
              )}
              {!loading && <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">{SLOTS.map(slot=>{const bk=bookedSlots.includes(slot),isSel=selSlot===slot;return(
                <button key={slot} onClick={()=>{if(!bk)setSelSlot(slot)}} disabled={bk} className={`py-2.5 px-2 rounded-xl font-mono text-sm font-600 transition-all ${isSel?'bg-teal-500 text-white shadow-teal':bk?'bg-slate-50 text-slate-300 line-through cursor-not-allowed':'glass hover:border-teal-300 text-slate-700'}`}>{slot}</button>
              )})}</div>}
            </div>
            <div className="flex gap-3"><button onClick={()=>setStep(2)} className="flex-1 btn-glass border border-slate-200 py-3 rounded-2xl font-700 text-slate-700">← Back</button><button onClick={()=>selSlot&&setStep(4)} disabled={!selSlot} className="flex-1 btn-teal py-3 rounded-2xl font-700 disabled:opacity-40 flex items-center justify-center gap-2">Continue<ChevronRight size={18}/></button></div>
          </motion.div>}
          
          {step===4&&<motion.div key="s4" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
            <div className="glass rounded-2xl p-6 mb-4">
              <h2 className="font-display font-800 text-xl mb-5">Your Details</h2>
              <div className="glass-teal rounded-xl p-3 mb-5 flex items-center gap-3">
                <Clock size={16} className="text-teal-600 shrink-0"/>
                <span className="font-display font-700 text-teal-800 text-sm">{selDate&&fmt(selDate)} at {selSlot} · {selectedMode?.label}</span>
                {mode === 'in-clinic' && <span className="ml-auto rounded-full bg-white/80 px-3 py-1 text-xs font-800 text-teal-700">₹{CLINIC_FEE}</span>}
              </div>
              <div className="flex flex-col gap-4">
                <div><label className="font-body text-sm font-600 text-slate-700 mb-1 block">Full Name *</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" className="w-full input-glass rounded-xl px-4 py-2.5 text-sm font-body"/></div>
                <div><label className="font-body text-sm font-600 text-slate-700 mb-1 block">WhatsApp / Phone *</label><div className="relative"><Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" type="tel" className="w-full input-glass rounded-xl px-4 py-2.5 pl-10 text-sm font-body"/></div></div>
                <div><label className="font-body text-sm font-600 text-slate-700 mb-1 block">Pain Description (optional)</label><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Briefly describe your pain…" rows={3} className="w-full input-glass rounded-xl px-4 py-2.5 text-sm font-body resize-none"/></div>
              </div>
              {mode === 'in-clinic' && (
                <div className="mt-4 rounded-2xl border border-white/40 bg-white/60 px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl">
                  Clinical visit fee: <span className="font-800 text-teal-700">₹{consultationFee}</span>
                </div>
              )}
            </div>
              <div className="flex gap-3"><button onClick={()=>setStep(3)} className="flex-1 btn-glass border border-slate-200 py-3 rounded-2xl font-700 text-slate-700">← Back</button><button onClick={submit} disabled={submitting} className="flex-1 btn-teal py-3 rounded-2xl font-700 disabled:opacity-60 flex items-center justify-center gap-2">{submitting?'Booking…':'Confirm Booking ✓'}</button></div>
          </motion.div>}
          
          {step===5&&booked&&<motion.div key="s5" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="glass rounded-2xl p-10 text-center">
            <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.2,type:'spring',stiffness:200}} className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center mx-auto mb-5 shadow-teal"><CheckCircle2 size={44} className="text-white"/></motion.div>
            <h2 className="font-display font-900 text-3xl text-slate-900 mb-2">Booking Confirmed!</h2>
            <p className="font-body text-slate-500 mb-1">{selDate&&fmt(selDate)} at <strong className="text-teal-700">{selSlot}</strong></p>
            <p className="font-body text-slate-500 mb-6">Dr. Dheerendra Pratap Singh  · {MODES.find(m=>m.id===mode)?.label}</p>
            <div className="flex items-center gap-2 justify-center mb-6"><MessageCircle size={16} className="text-green-600"/><span className="font-body text-sm text-slate-600">WhatsApp confirmation sent! (Feature 12)</span></div>
            <div className="flex gap-3 justify-center">
              <button onClick={()=>{setStep(1);setBooked(false);setSelDate(null);setSelSlot(null)}} className="btn-glass border border-slate-200 px-6 py-2.5 rounded-xl font-700 text-slate-700">Book Another</button>
              <button className="btn-teal px-6 py-2.5 rounded-xl font-700">View Dashboard</button>
            </div>
          </motion.div>}
        </AnimatePresence>
      </main>
      <Footer/><FloatingActions/>
    </div>
  )
}