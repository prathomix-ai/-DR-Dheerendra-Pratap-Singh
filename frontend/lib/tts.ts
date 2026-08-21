import { type Lang, TTS_MESSAGES } from './i18n'

const LANG_CODES: Record<Lang, string> = {
  en: 'en-US', hi: 'hi-IN', hinglish: 'hi-IN', ta: 'ta-IN',
}

let lastUtterance: SpeechSynthesisUtterance | null = null
let lastSpoken = ''
let lastSpokenAt = 0
const COOLDOWN_MS = 3500

export function getTTSRate(): number {
  if (typeof window === 'undefined') return 0.92
  const val = parseFloat(localStorage.getItem('prathomix_tts_rate') || '0.92')
  return Number.isNaN(val) ? 0.92 : val
}

export function setTTSRate(rate: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('prathomix_tts_rate', String(rate))
}

export function getTTSPitch(): number {
  if (typeof window === 'undefined') return 1.0
  const val = parseFloat(localStorage.getItem('prathomix_tts_pitch') || '1.0')
  return Number.isNaN(val) ? 1.0 : val
}

export function setTTSPitch(pitch: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('prathomix_tts_pitch', String(pitch))
}

export function speakFeedback(key: string, lang: Lang, force = false): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const msg = TTS_MESSAGES[lang]?.[key] || TTS_MESSAGES['en']?.[key]
  if (!msg) return
  const now = Date.now()
  if (!force && lastSpoken === key && now - lastSpokenAt < COOLDOWN_MS) return
  lastSpoken = key
  lastSpokenAt = now
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(msg)
  utt.lang = LANG_CODES[lang]
  utt.rate = getTTSRate()
  utt.pitch = getTTSPitch()
  utt.volume = 1

  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v => v.lang.startsWith(LANG_CODES[lang].split('-')[0]))
  if (preferred) utt.voice = preferred
  lastUtterance = utt
  window.speechSynthesis.speak(utt)
}

export function speakCustom(text: string, lang: Lang): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = LANG_CODES[lang]
  utt.rate = getTTSRate()
  utt.pitch = getTTSPitch()
  utt.volume = 1
  window.speechSynthesis.speak(utt)
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}
