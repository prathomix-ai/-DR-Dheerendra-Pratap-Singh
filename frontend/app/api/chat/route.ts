import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const SAFE_FALLBACK = 'System is busy right now, but your health is important. Please book a direct appointment with Dr. Dheerendra Pratap Singh.'
const TRIAGE_SYSTEM_PROMPT = 'You are the AI Assistant for Prathomix Physio. RULE 1: NEVER repeat your intro greeting. RULE 2: Answer directly in 1-2 short sentences. RULE 3: Do not hallucinate features or make up medical advice. Always guide users to book a clinic visit.'

type ChatTurn = {
  role?: string
  content?: string
}

function normalizeHistory(value: unknown): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((turn): ChatTurn | null => {
      if (!turn || typeof turn !== 'object') {
        return null
      }

      const candidate = turn as ChatTurn
      const role = String(candidate.role || '').trim().toLowerCase()
      const content = String(candidate.content || '').trim()

      if (!content) {
        return null
      }

      if (role === 'assistant' || role === 'ai' || role === 'model') {
        return { role: 'assistant', content }
      }

      if (role === 'user') {
        return { role: 'user', content }
      }

      return null
    })
    .filter((turn): turn is { role: 'user' | 'assistant'; content: string } => Boolean(turn))
}

// 1. Direct local matching for greetings and clinical queries (Saves 100% of API keys!)
function checkLocalRouter(message: string, language: string, region: string): any | null {
  const msg = message.toLowerCase().trim()
  const lang = (language || 'en').toLowerCase().trim()

  // GREETINGS
  const greetings = ['hi', 'hello', 'hey', 'namaste', 'halo', 'hola', 'yo', 'salam', 'kaise ho', 'kaisa', 'who are you', 'reception']
  if (greetings.some(g => msg === g || msg.startsWith(g + ' ') || msg.endsWith(' ' + g))) {
    let reply = "Namaste! Main Prathomix AI Agent (digital receptionist) hoon. Main aapke pain symptoms evaluate karne me help kar sakta/sakti hoon. Please apna pain area, duration aur symptoms batayein."
    let suggestions = ['Lower Back Pain 🟡', 'Knee Pain 🔵', 'Shoulder Stiffness 🔴', 'Book Appointment']

    if (lang === 'hi') {
      reply = "नमस्ते! मैं प्रथोमिक्स एआई एजेंट (डिजिटल रिसेप्शनिस्ट) हूँ। मैं आपके दर्द के लक्षणों का मूल्यांकन करने में मदद कर सकता हूँ। कृपया अपना दर्द क्षेत्र, अवधि और लक्षण बताएं।"
      suggestions = ['पीठ का दर्द 🟡', 'घुटने का दर्द 🔵', 'कंधे का दर्द 🔴', 'अपॉइंटमेंट बुक करें']
    } else if (lang === 'ta') {
      reply = "வணக்கம்! நான் பிரதாமிக்ஸ் AI முகவர். உங்கள் வலி அறிகுறிகளை மதிப்பிட நான் உங்களுக்கு உதவ முடியும். உங்கள் வலி பகுதி மற்றும் அறிகுறிகளைப் பகிர்ந்து கொள்ளுங்கள்."
      suggestions = ['முதுகு வலி 🟡', 'முழங்கால் வலி 🔵', 'தோள்பட்டை வலி 🔴', 'அப்பாயிண்ட்மெண்ட்']
    }

    return {
      reply,
      navigate_to: null,
      suggestions,
      rag_sources: 0,
      powered_by: 'Prathomix Local Agent Router (Fast)'
    }
  }

  // APPOINTMENT / FEE / TIMINGS
  const appointments = ['book', 'appointment', 'appoint', 'milan', 'meet', 'timing', 'time', 'hours', 'schedule', 'fee', 'fees', 'charges', 'opd', 'cost', 'rupees', 'rs']
  if (appointments.some(keyword => msg.includes(keyword))) {
    let reply = "Dr. Dheerendra Pratap Singh (BPT, MPT Ortho) has 3+ years of clinical experience. The OPD Fee is ₹300. You can book an appointment slot directly here: [NAVIGATE:/appointments]"
    let suggestions = ['Book Appointment 📅', 'View Exercises 🏃', 'About Doctor 🩺']

    if (lang === 'hi' || lang === 'hinglish') {
      reply = "डॉ. धीरेंद्र प्रताप सिंह (BPT, MPT ऑर्थो) को 3+ साल का अनुभव है। OPD शुल्क ₹300 है। आप अपॉइंटमेंट बुक करने के लिए यहाँ क्लिक कर सकते हैं: [NAVIGATE:/appointments]"
      suggestions = ['अपॉइंटमेंट बुक करें 📅', 'व्यायाम देखें 🏃', 'डॉक्टर के बारे में 🩺']
    } else if (lang === 'ta') {
      reply = "டாக்டர். தீரேந்திர பிரதாப் சிங் 3+ ஆண்டுகள் அனுபவம் கொண்டவர். OPD கட்டணம் ₹300. நீங்கள் அப்பாயிண்ட்மெண்ட் செய்ய இங்கே கிளிக் செய்யவும்: [NAVIGATE:/appointments]"
      suggestions = ['அப்பாயிண்ட்மெண்ட் 📅', 'பயிற்சிகள் 🏃', 'டாக்டர் பற்றி 🩺']
    }

    return {
      reply,
      navigate_to: '/appointments',
      suggestions,
      rag_sources: 0,
      powered_by: 'Prathomix Local Agent Router (Fast)'
    }
  }

  // EXERCISES / DASHBOARD
  const exercises = ['exercise', 'exercises', 'kasrat', 'rehab', 'pose', 'camera', 'live test', 'correction', 'gait', 'walk']
  if (exercises.some(keyword => msg.includes(keyword))) {
    let reply = "Aap exercises directly home page par ya apne dashboard me dekh sakte hain. AI camera evaluation ke liye exercises section me jayein: [NAVIGATE:/exercises]"
    let suggestions = ['View Exercises 🏃', 'Pose AI Camera 🎥', 'Dashboard']

    if (lang === 'en') {
      reply = "You can view assigned exercises and practice them with AI pose correction in the exercises tab: [NAVIGATE:/exercises]"
      suggestions = ['View Exercises 🏃', 'Pose AI Camera 🎥', 'Dashboard']
    } else if (lang === 'ta') {
      reply = "உடற்பயிற்சி செய்ய மற்றும் AI கேமரா மூலம் சரிபார்க்க உடற்பயிற்சி பகுதிக்குச் செல்லவும்: [NAVIGATE:/exercises]"
      suggestions = ['பயிற்சிகள் 🏃', 'கேமரா AI 🎥', 'டேஷ்போர்டு']
    }

    return {
      reply,
      navigate_to: '/exercises',
      suggestions,
      rag_sources: 0,
      powered_by: 'Prathomix Local Agent Router (Fast)'
    }
  }

  return null
}

// 2. Direct Gemini REST API fetch (Multi-key round-robin rotation + fallbacks)
async function generateGeminiDirect(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string,
  language: string,
  region: string
): Promise<string> {
  const rawKeys = process.env.GEMINI_KEYS || process.env.GEMINI_API_KEY || "AIzaSyCMOEGn9uadw28MZHVEZ683ea99V5khp9c,AIzaSyC3OwQp9F7oRoTMONtDBajm83RLtl3a6u4,AIzaSyBu6NJ7y0HTWQE5WOh0T3gS-2urUbwMjBg"
  const keys = rawKeys.split(',').map(k => k.trim()).filter(Boolean)

  if (!keys.length) {
    throw new Error('No Gemini keys configured')
  }

  // Pick a key randomly to distribute load across API keys
  const keyIndex = Math.floor(Math.random() * keys.length)
  const apiKey = keys[keyIndex]

  // Truncate history to last 3 turns to minimize token consumption and avoid hitting rate limits
  const maxHistoryTurns = 3
  const recentHistory = history.slice(-maxHistoryTurns * 2)

  // Map to Gemini chat contents structure
  const contents = recentHistory.map(turn => ({
    role: turn.role === 'user' ? 'user' : 'model',
    parts: [{ text: turn.content }]
  }))

  // Append the current message
  const userPrompt = `Analyze this patient's query: "${message}". Selected body region: "${region || 'general'}". Preferred language: "${language}". 
Provide an empathetic response. Never diagnose with certainty. Answer directly in 1-2 short sentences. 
If they need treatment or seem worried, suggest booking a clinic visit at [NAVIGATE:/appointments] or viewing exercises at [NAVIGATE:/exercises].`

  contents.push({
    role: 'user',
    parts: [{ text: userPrompt }]
  })

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 250
      },
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini direct query failed: ${errorText}`)
  }

  const result = await response.json()
  const replyText = result.candidates?.[0]?.content?.parts?.[0]?.text || ''

  if (!replyText) {
    throw new Error('Empty response from Gemini API')
  }

  return replyText.trim()
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({}))
    const normalizedMessages = normalizeHistory(payload.messages ?? payload.history)
    const message = typeof payload.message === 'string' ? payload.message.trim() : normalizedMessages.filter((turn) => turn.role === 'user').at(-1)?.content || ''
    const region = typeof payload.region === 'string' ? payload.region.trim() : ''
    const language = typeof payload.language === 'string' && payload.language.trim() ? payload.language.trim() : 'en'

    if (!message) {
      return NextResponse.json({
        reply: SAFE_FALLBACK,
        navigate_to: '/appointments',
        suggestions: ['Book appointment', 'View exercises', 'Describe symptoms'],
        rag_sources: 0,
        powered_by: 'Prathomix Assistant',
      })
    }

    // A. Check local quick router first (0ms delay, 0 API key usage!)
    const localMatch = checkLocalRouter(message, language, region)
    if (localMatch) {
      return NextResponse.json(localMatch)
    }

    // B. Call python backend
    try {
      const authorizationHeader = request.headers.get('authorization')
      const backendResponse = await fetch(`${BACKEND_URL}/api/triage/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
        },
        cache: 'no-store',
        body: JSON.stringify({
          message,
          region,
          language,
          messages: normalizedMessages,
          history: normalizedMessages,
          system_prompt: TRIAGE_SYSTEM_PROMPT,
        }),
      })

      if (backendResponse.ok) {
        const backendData = await backendResponse.json().catch(() => null)
        if (backendData) {
          return NextResponse.json(backendData)
        }
      }
    } catch (backendErr) {
      console.warn('Python backend triage chat unavailable, falling back to direct Gemini:', backendErr)
    }

    // C. Direct Gemini API Fallback (runs in Next.js itself if Python backend is offline or on Vercel)
    try {
      const reply = await generateGeminiDirect(message, normalizedMessages, TRIAGE_SYSTEM_PROMPT, language, region)

      // Parse navigate_to command from reply
      let nav: string | null = null
      let cleanReply = reply
      const navMatch = reSearchNavigate(reply)
      if (navMatch) {
        nav = navMatch.path
        cleanReply = reply.replace(navMatch.raw, '').trim()
      }

      const suggestions = region
        ? [
            `Why does my ${region.replace(/_/g, ' ')} hurt?`,
            'Best exercises',
            'Book appointment',
            'How serious is this?',
          ]
        : [
            'What causes this pain?',
            'Best exercises for me',
            'How long to recover?',
            'Book appointment',
          ]

      return NextResponse.json({
        reply: cleanReply || SAFE_FALLBACK,
        navigate_to: nav,
        suggestions,
        rag_sources: 0,
        powered_by: 'Prathomix Direct Gemini Agent (Fallback)',
      })
    } catch (geminiErr) {
      console.error('Direct Gemini Fallback Failed:', geminiErr)
    }

    // D. Global Safe Fallback
    return NextResponse.json({
      reply: SAFE_FALLBACK,
      navigate_to: '/appointments',
      suggestions: ['Book appointment', 'View exercises', 'Describe symptoms'],
      rag_sources: 0,
      powered_by: 'Prathomix Triage System',
    })
  } catch (error) {
    console.error('Chat route proxy failed', error)
    return NextResponse.json({
      reply: SAFE_FALLBACK,
      navigate_to: '/appointments',
      suggestions: ['Book appointment', 'View exercises', 'Describe symptoms'],
      rag_sources: 0,
      powered_by: 'Prathomix Triage System',
    })
  }
}

// Helper to extract navigation tags like [NAVIGATE:/appointments]
function reSearchNavigate(text: string): { raw: string; path: string } | null {
  const match = text.match(/\[NAVIGATE:([^\]]+)\]/)
  if (match) {
    return {
      raw: match[0],
      path: match[1].trim()
    }
  }
  return null
}
