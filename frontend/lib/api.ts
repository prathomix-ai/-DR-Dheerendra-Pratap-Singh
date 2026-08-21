import axios from 'axios'
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const api = axios.create({ baseURL: API, timeout: 30000, headers: { 'Content-Type': 'application/json' } })
api.interceptors.request.use(c => {
  const t = typeof window !== 'undefined' ? localStorage.getItem('prathomix_token') : null
  if (t) c.headers.Authorization = `Bearer ${t}`
  return c
})
api.interceptors.response.use(r => r, e => {
  if (e.response?.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('prathomix_token'); localStorage.removeItem('prathomix_user')
  }
  return Promise.reject(e)
})

export const triageAPI = {
  chat:   async (msg: string, region: string, lang: string, messages: any[]) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('prathomix_token') : null
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message: msg, region, language: lang, messages }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.error || data?.detail || 'Triage request failed')
    }
    return { data }
  },
  voice:  (blob: Blob, lang: string) => {
    const fd = new FormData(); fd.append('audio', blob, 'voice.webm'); fd.append('language', lang)
    return api.post('/api/triage/voice', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}
export const appointmentsAPI = {
  list:   () => api.get('/api/appointments'),
  book:   (d: any) => api.post('/api/appointments', d),
  cancel: (id: string) => api.delete(`/api/appointments/${id}`),
  slots:  (date: string) => api.get(`/api/appointments/slots?date=${date}`),
}
export const dashboardAPI = {
  get:             (pid: string) => api.get(`/api/dashboard/${pid}`),
  exercises:       (pid: string) => api.get(`/api/exercises/${pid}`),
  completeEx:      (id: string, data: any) => api.post(`/api/exercises/${id}/complete`, data),
  progress:        (pid: string) => api.get(`/api/progress/${pid}`),
  downloadPDF:     (pid: string) => api.get(`/api/pdf/prescription/${pid}`, { responseType: 'blob' }),
  uploadOCR:       (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/api/ocr/prescription', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getPainMap:      (pid: string) => api.get(`/api/pain-map/${pid}`),
  getPrescription: (pid: string) => api.get(`/api/prescription/${pid}`),
}
export const poseAPI = {
  analyze: (image: string, exercise_name: string) =>
    api.post('/api/pose/analyze', { image, exercise_name }),
}
export const adminAPI = {
  login:               (password: string) => api.post('/api/auth/admin/login', { password }),
  patients:            () => api.get('/api/admin/patients'),
  analytics:           () => api.get('/api/admin/analytics'),
  scores:              () => api.get('/api/admin/mediapipe-scores'),
  sendMsg:             (patient_id: string, message: string, channel: string) =>
    api.post('/api/admin/message', { patient_id, message, channel }),
  assignExercise:      (data: any) => api.post('/api/admin/assign-exercise', data),
  updatePainMap:       (patient_id: string, regions: string[]) =>
    api.post('/api/admin/pain-map', { patient_id, regions }),
  uploadPrescription:  (patient_id: string, file: File) => {
    const fd = new FormData(); fd.append('file', file); fd.append('patient_id', patient_id)
    return api.post('/api/admin/prescription/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getExerciseLibrary:  () => api.get('/api/admin/exercise-library'),
}
export const settingsAPI = {
  get:    (uid: string) => api.get(`/api/settings/${uid}`),
  update: (uid: string, data: any) => api.put(`/api/settings/${uid}`, data),
}
export const authAPI = {
  login:    (email: string, password: string) => api.post('/api/auth/login', { email, password }),
  register: (data: any) => api.post('/api/auth/register', data),
  adminLogin: (password: string) => api.post('/api/auth/admin/login', { password }),
  me: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
}
export default api
