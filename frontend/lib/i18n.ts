export type Language = 'en' | 'hi' | 'hinglish' | 'ta' ;
export type Lang = Language

export const TTS_MESSAGES: Record<Language, Record<string, string>> = {
  en: {
    back_straight: 'Straighten your back. Keep your spine aligned.',
    knee_extend:   'Extend your knee fully. Hold for 3 seconds.',
    good_form:     'Excellent form! Keep it up.',
    lower_hips:    'Lower your hips slightly. Maintain control.',
    core_engage:   'Engage your core. Tighten your abdominal muscles.',
    too_fast:      'Slow down. Perform the movement with control.',
    rep_complete:  'Rep complete. Well done!',
    exercise_done: 'Exercise complete. Great work today!',
  },
  hi: {
    back_straight: 'अपनी पीठ सीधी करें। रीढ़ की हड्डी सीधी रखें।',
    knee_extend:   'घुटने को पूरी तरह फैलाएं। 3 सेकंड रोकें।',
    good_form:     'बेहतरीन! इसी तरह जारी रखें।',
    lower_hips:    'कूल्हों को थोड़ा नीचे करें।',
    core_engage:   'पेट की मांसपेशियों को कस लें।',
    too_fast:      'धीमे करें। नियंत्रण के साथ करें।',
    rep_complete:  'एक रेप पूरा हुआ। शाबाश!',
    exercise_done: 'व्यायाम पूरा हुआ। बहुत अच्छे!',
  },
  hinglish: {
    back_straight: 'Apni back seedhi raho. Spine aligned rakho.',
    knee_extend:   'Knee ko poora extend karo. 3 second hold karo.',
    good_form:     'Excellent form! Aise hi continue karo.',
    lower_hips:    'Hips thoda neeche karo. Control rakho.',
    core_engage:   'Core engage karo. Pet ki muscles tight karo.',
    too_fast:      'Dhire karo. Control se karo movement.',
    rep_complete:  'Ek rep complete! Shabash!',
    exercise_done: 'Exercise complete! Aaj bahut achha kiya!',
  },
  ta: {
    back_straight: 'உங்கள் முதுகை நேராக்குங்கள். உங்கள் முதுகெலும்பை நேராக வைக்கவும்.',
    knee_extend:   'உங்கள் முழங்காலை முழுமையாக நீட்டவும். 3 வினாடிகள் வைத்திருக்கவும்.',
    good_form:     'சிறந்த நிலை! அப்படியே தொடருங்கள்.',
    lower_hips:    'உங்கள் இடுப்பை சிறிது கீழே இறக்கவும்.',
    core_engage:   'உங்கள் வயிற்று தசைகளை இறுக்குங்கள்.',
    too_fast:      'வேகத்தை குறைக்கவும். கட்டுப்பாட்டுடன் இயக்கத்தை செய்யவும்.',
    rep_complete:  'ஒரு முறை முடிந்தது. மிக நன்று!',
    exercise_done: 'பயிற்சி முடிந்தது. இன்று சிறந்த வேலை!',
  },
}

export const translations: Record<Language, {
  heroTitle: string
  heroSub: string
  btnPrimary: string
  btnSecondary: string
  leadPhysio: string
  specialistTitle: string
  doctorBioParagraph1: string
  doctorBioParagraph2: string
  experienceVal: string
  experienceLabel: string
  healingVal: string
  healingLabel: string
  focusVal: string
  focusLabel: string
  feeVal: string
  feeLabel: string
  orthoCare: string
  rehab: string
  followUp: string
  aboutSubtitle: string
  aboutTitle: string
  verifiedCare: string
}> = {
  en: {
    heroTitle: 'Fix Your Pain, Right From Home.',
    heroSub: 'Get treated by Dr. Dheerendra Pratap Singh. Check your pain online and book a clinic visit.',
    btnPrimary: 'Check Your Pain (Free)',
    btnSecondary: 'Book Clinic Visit',
    leadPhysio: 'Lead Physiotherapist',
    specialistTitle: 'BPT, MPT (Ortho) — Musculoskeletal & Sports Specialist',
    doctorBioParagraph1: 'Dr. Dheerendra Pratap Singh is an expert physiotherapist with over 3 years of experience in treating bone and joint pain, sports injuries, and complex musculoskeletal conditions. He specializes in advanced orthopedic physiotherapy, injury management, and complete physical rehabilitation.',
    doctorBioParagraph2: 'His mission is to provide world-class, affordable recovery care to every patient. Combining 3+ years of clinical excellence with our cutting-edge AI pose feedback technology, we ensure you perform your exercises safely and correctly at home, enabling a faster, pain-free return to your daily life.',
    experienceVal: '3+ Years',
    experienceLabel: 'Clinical Experience',
    healingVal: 'Safe Healing',
    healingLabel: 'Trusted Clinic Care',
    focusVal: 'Personal Focus',
    focusLabel: 'One-on-One Sessions',
    feeVal: '₹300',
    feeLabel: 'OPD Fee',
    orthoCare: 'Ortho Care',
    rehab: 'Rehab',
    followUp: 'Clinical Follow-up',
    aboutSubtitle: 'Get expert care from Dr. Dheerendra Pratap Singh, combined with the power of modern AI technology for faster recovery.',
    aboutTitle: 'About Our Clinic',
    verifiedCare: 'Verified Physiotherapy Care',
  },
  hi: {
    heroTitle: 'घर बैठे अपने दर्द का सही इलाज पाएं।',
    heroSub: 'डॉ. धीरेंद्र प्रताप सिंह से विशेषज्ञ उपचार लें। ऑनलाइन दर्द चेक करें या क्लिनिक आएं।',
    btnPrimary: 'दर्द चेक करें (मुफ्त)',
    btnSecondary: 'अपॉइंटमेंट बुक करें',
    leadPhysio: 'मुख्य फिजियोथेरेपिस्ट',
    specialistTitle: 'BPT, MPT (ऑर्थो) — मस्कुलोस्केलेटल और स्पोर्ट्स स्पेशलिस्ट',
    doctorBioParagraph1: 'डॉ. धीरेंद्र प्रताप सिंह एक विशेषज्ञ फिजियोथेरेपिस्ट हैं, जिन्हें हड्डियों और जोड़ों के दर्द, खेल की चोटों और जटिल मस्कुलोस्केलेटल स्थितियों के इलाज में 3 से अधिक वर्षों का अनुभव है। वे उन्नत आर्थोपेडिक फिजियोथेरेपी, चोट प्रबंधन और पूर्ण शारीरिक पुनर्वास के विशेषज्ञ हैं।',
    doctorBioParagraph2: 'उनका मिशन हर मरीज को विश्व स्तरीय और किफायती इलाज प्रदान करना है। हमारे क्लिनिक की अत्याधुनिक एआई तकनीक और उनके 3+ वर्षों के अनुभव के साथ, हम यह सुनिश्चित करते हैं कि आप घर पर भी सुरक्षित और सही ढंग से व्यायाम करें, जिससे आप तेजी से और दर्द रहित होकर अपनी सामान्य जिंदगी में वापस लौट सकें।',
    experienceVal: '3+ वर्ष',
    experienceLabel: 'क्लिनिकल अनुभव',
    healingVal: 'सुरक्षित इलाज',
    healingLabel: 'भरोसेमंद क्लिनिक देखभाल',
    focusVal: 'व्यक्तिगत ध्यान',
    focusLabel: 'वन-ऑन-वन सत्र',
    feeVal: '₹300',
    feeLabel: 'ओपीडी शुल्क',
    orthoCare: 'ऑर्थो केयर',
    rehab: 'पुनर्वास',
    followUp: 'क्लिनिकल फॉलो-अप',
    aboutSubtitle: 'डॉ. धीरेंद्र प्रताप सिंह से विशेषज्ञ देखभाल प्राप्त करें, तेजी से रिकवरी के लिए आधुनिक एआई तकनीक के साथ।',
    aboutTitle: 'हमारे क्लिनिक के बारे में',
    verifiedCare: 'सत्यापित फिजियोथेरेपी देखभाल',
  },
  hinglish: {
    heroTitle: 'Ghar Baithe Apne Dard Ka Ilaj Payein.',
    heroSub: 'Dr. Dheerendra Pratap Singh se expert treatment lein. Online pain check karein ya clinic visit book karein.',
    btnPrimary: 'Pain Check Karein (Free)',
    btnSecondary: 'Clinic Visit Book Karein',
    leadPhysio: 'Lead Physiotherapist',
    specialistTitle: 'BPT, MPT (Ortho) — Musculoskeletal & Sports Specialist',
    doctorBioParagraph1: 'Dr. Dheerendra Pratap Singh ek expert physiotherapist hain, jinhe bone aur joint pain, sports injuries aur complex musculoskeletal conditions ke treatment me 3+ years ka experience hai. Wo advanced orthopedic physiotherapy, injury management aur complete physical rehabilitation ke specialist hain.',
    doctorBioParagraph2: 'Unka mission har patient ko world-class aur affordable recovery care dena hai. Apne 3+ years ke experience aur humari cutting-edge AI technology ke sath, wo ensure karte hain ki aap ghar par bhi exercise sahi tarike se karein, jisse aap jaldi thik ho sakein.',
    experienceVal: '3+ Years',
    experienceLabel: 'Clinical Experience',
    healingVal: 'Safe Healing',
    healingLabel: 'Trusted Clinic Care',
    focusVal: 'Personal Focus',
    focusLabel: 'One-on-One Sessions',
    feeVal: '₹300',
    feeLabel: 'OPD Fee',
    orthoCare: 'Ortho Care',
    rehab: 'Rehab',
    followUp: 'Clinical Follow-up',
    aboutSubtitle: 'Dr. Dheerendra Pratap Singh se expert care lein, aur fast recovery ke liye modern AI tech ka use karein.',
    aboutTitle: 'Our Clinic Ke Baare Me',
    verifiedCare: 'Verified Physiotherapy Care',
  },
  ta: {
    heroTitle: 'உங்கள் வலியை வீட்டிலிருந்தே சரிசெய்யுங்கள்.',
    heroSub: 'டாக்டர். தீரேந்திர பிரதாப் சிங்கிடம் சிகிச்சை பெறுங்கள். உங்கள் வலியை ஆன்லைனில் சரிபார்த்து கிளினிக் வருகையை பதிவு செய்யவும்.',
    btnPrimary: 'வலியை சரிபார்க்கவும் (இலவசம்)',
    btnSecondary: 'கிளினிக் அப்பாயிண்ட்மெண்ட்',
    leadPhysio: 'தலைமை பிசியோதெரபிஸ்ட்',
    specialistTitle: 'BPT, MPT (ஆர்த்தோ) — தசைநார் & விளையாட்டு காயம் நிபுணர்',
    doctorBioParagraph1: 'டாக்டர். தீரேந்திர பிரதாப் சிங் அவர்கள் 3 ஆண்டுகளுக்கும் மேலாக எலும்பு மற்றும் மூட்டு வலி, விளையாட்டு காயங்கள் மற்றும் தசைநார் கோளாறுகளுக்கு சிகிச்சை அளிப்பதில் சிறந்த அனுபவம் வாய்ந்த உடற்பயிற்சி நிபுணர் ஆவார். அவர் எலும்பு சிகிச்சை, காயம் மேலாண்மை மற்றும் முழுமையான உடல் மறுவாழ்வு ஆகியவற்றில் நிபுணத்துவம் பெற்றவர்.',
    doctorBioParagraph2: 'ஒவ்வொரு நோயாளிக்கும் உலகத்தரம் வாய்ந்த, மலிவு விலையில் மறுவாழ்வு சிகிச்சை அளிப்பதே இவரது நோக்கமாகும். எங்களின் அதிநவீன AI தொழில்நுட்பத்துடன் அவரது 3+ ஆண்டுகால மருத்துவ அனுபவத்தை இணைத்து, நீங்கள் வீட்டிலேயே பாதுகாப்பாகவும் சரியாகவும் உடற்பயிற்சி செய்வதை நாங்கள் உறுதிசெய்கிறோம்.',
    experienceVal: '3+ ஆண்டுகள்',
    experienceLabel: 'மருத்துவ அனுபவம்',
    healingVal: 'பாதுகாப்பான சிகிச்சை',
    healingLabel: 'நம்பகமான கிளினிக் சிகிச்சை',
    focusVal: 'தனிப்பட்ட கவனம்',
    focusLabel: 'நேரடி சிகிச்சை அமர்வுகள்',
    feeVal: '₹300',
    feeLabel: 'OPD கட்டணம்',
    orthoCare: 'எலும்பு சிகிச்சை',
    rehab: 'மறுவாழ்வு சிகிச்சை',
    followUp: 'தொடர் மருத்துவ கண்காணிப்பு',
    aboutSubtitle: 'டாக்டர். தீரேந்திர பிரதாப் சிங்கிடம் இருந்து நிபுணர் சிகிச்சை பெறுங்கள், விரைவாக குணமடைய நவீன AI தொழில்நுட்பத்துடன்.',
    aboutTitle: 'எங்கள் கிளினிக் பற்றி',
    verifiedCare: 'சரிபார்க்கப்பட்ட பிசியோதெரபி சிகிச்சை',
  },
}

export const TRANSLATIONS = translations
export function t(lang: Lang, key: string): string {
  // @ts-ignore
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['en']?.[key] ?? key
}
export const LANGUAGES = [
  { code: 'en'       as Lang, label: 'English',  flag: '🇬🇧' },
  { code: 'hi'       as Lang, label: 'हिंदी',    flag: '🇮🇳' },
  { code: 'hinglish' as Lang, label: 'Hinglish', flag: '🇮🇳' },
  { code: 'ta'       as Lang, label: 'தமிழ்',     flag: '🇮🇳' },
]