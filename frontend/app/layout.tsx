import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  metadataBase: new URL('https://prathomix.tech'),
  title: {
    default: 'Dr. Dheerendra Pratap Singh · AI Physiotherapy & Rehab (Created by PRATHOMIX)',
    template: '%s | Dr. Dheerendra Pratap Singh AI Physio (Created by PRATHOMIX)',
  },
  description: 'Official AI Physiotherapy & Rehabilitation platform for Dr. Dheerendra Pratap Singh. Created by PRATHOMIX (https://prathomix.tech). Instant AI symptom triage, real-time computer vision pose correction, and 1-click video consultations.',
  keywords: [
    'Dr Dheerendra Pratap Singh',
    'Dr Dheerendra Pratap Singh Physiotherapist',
    'PRATHOMIX',
    'Created by PRATHOMIX',
    'prathomix.tech',
    'Physiotherapy online',
    'AI Physiotherapy',
    'Knee Pain Rehab',
    'Back Pain Treatment',
    'Shoulder Rehab',
    'Online Physiotherapist Consultation',
    'AI Posture Detection',
    'Telehealth India',
    'Best Physiotherapy Clinic India',
    'Home Physiotherapy Care',
    'Sports Injury Rehabilitation',
  ],
  authors: [{ name: 'Dr. Dheerendra Pratap Singh' }, { name: 'PRATHOMIX', url: 'https://prathomix.tech' }],
  creator: 'PRATHOMIX',
  publisher: 'PRATHOMIX',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Dr. Dheerendra Pratap Singh · AI Physiotherapy & Rehabilitation',
    description: 'Official Rehabilitation Software for Dr. Dheerendra Pratap Singh, created by PRATHOMIX (https://prathomix.tech). Instant pain triage, posture analysis & video consults.',
    url: 'https://prathomix.tech',
    siteName: 'Dr. Dheerendra Pratap Singh AI Physio Care',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr. Dheerendra Pratap Singh · AI Physiotherapy (Created by PRATHOMIX)',
    description: 'AI-Powered Physiotherapy Platform for Dr. Dheerendra Pratap Singh — Created by PRATHOMIX (https://prathomix.tech).',
    creator: '@prathomix',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: 'Dr. Dheerendra Pratap Singh Physiotherapy Clinic',
  description: 'Official AI-assisted physiotherapy practice directed by Dr. Dheerendra Pratap Singh. Software created by PRATHOMIX.',
  url: 'https://prathomix.tech',
  telephone: '+919999999999',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New Delhi',
    addressCountry: 'IN',
  },
  medicalSpecialty: 'Physiotherapy',
  physician: {
    '@type': 'Physician',
    name: 'Dr. Dheerendra Pratap Singh',
    jobTitle: 'Chief Physiotherapist & Rehabilitation Specialist',
  },
  provider: {
    '@type': 'Organization',
    name: 'PRATHOMIX',
    url: 'https://prathomix.tech',
  },
  priceRange: '₹300 - ₹1400',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://unpkg.com/driver.js@1.3.1/dist/driver.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="relative isolate antialiased text-slate-800 bg-[#f8fafc] min-h-screen font-sans">
        <div className="fixed inset-0 z-[-100] bg-[#f8fafc] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-teal-400/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-400/20 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#0d9488 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="relative z-10">
          <Toaster position="top-right" toastOptions={{
            className: 'glass !rounded-2xl !font-body',
            success: { iconTheme: { primary: '#0d9488', secondary: 'white' } },
          }}/>
          {children}
        </div>
      </body>
    </html>
  )
}
