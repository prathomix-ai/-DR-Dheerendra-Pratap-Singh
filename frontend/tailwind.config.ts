import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit','sans-serif'],
        body:    ['Plus Jakarta Sans','sans-serif'],
        mono:    ['JetBrains Mono','monospace'],
      },
      colors: {
        teal: { 50:'#f0fdfa',100:'#ccfbf1',200:'#99f6e4',300:'#5eead4',400:'#2dd4bf',500:'#14b8a6',600:'#0d9488',700:'#0f766e',800:'#115e59',900:'#134e4a' },
        sage: { 400:'#6abd6a',500:'#4caf50',600:'#388e3c' },
      },
      animation: {
        'mesh':        'meshGrad 10s ease infinite',
        'pulse-glow':  'pulseGlow 2.5s ease-in-out infinite',
        'scan':        'scanLine 3s linear infinite',
        'spin-slow':   'spin 12s linear infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'float':       'float 6s ease-in-out infinite',
        'slide-left':  'slideLeft 0.4s ease-out',
        'fade-up':     'fadeUp 0.5s ease-out',
      },
      keyframes: {
        meshGrad:   { '0%,100%':{ backgroundPosition:'0% 50%' },'50%':{ backgroundPosition:'100% 50%' } },
        pulseGlow:  { '0%,100%':{ opacity:'1',transform:'scale(1)' },'50%':{ opacity:'0.45',transform:'scale(1.22)' } },
        scanLine:   { '0%':{ transform:'translateY(-100%)' },'100%':{ transform:'translateY(400%)' } },
        float:      { '0%,100%':{ transform:'translateY(0)' },'50%':{ transform:'translateY(-10px)' } },
        slideLeft:  { from:{ opacity:'0',transform:'translateX(20px)' },to:{ opacity:'1',transform:'translateX(0)' } },
        fadeUp:     { from:{ opacity:'0',transform:'translateY(16px)' },to:{ opacity:'1',transform:'translateY(0)' } },
        shimmer:    { '0%':{ backgroundPosition:'-200% 0' },'100%':{ backgroundPosition:'200% 0' } },
      },
      boxShadow: {
        glass:    '0 8px 30px rgba(0,0,0,0.04),inset 0 1px 0 rgba(255,255,255,0.65)',
        'glass-lg':'0 16px 40px rgba(0,0,0,0.07),inset 0 1px 0 rgba(255,255,255,0.75)',
        teal:     '0 0 18px rgba(13,148,136,0.35)',
        'teal-lg':'0 0 32px rgba(13,148,136,0.5)',
        'teal-sm':'0 0 8px rgba(13,148,136,0.24)',
      },
    },
  },
  plugins: [],
}
export default config
