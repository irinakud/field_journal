import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `******
  return config
})

export interface AuthResponse {
  token: string
  username: string
  email: string
}

export interface Observation {
  id: number
  species: string
  location: string
  notes: string
  photoUrl?: string
  latitude?: number
  longitude?: number
  observedAt: string
  createdAt: string
  userId: number
  username: string
}

export interface CreateObservationPayload {
  species: string
  location: string
  notes: string
  photoUrl?: string
  latitude?: number
  longitude?: number
  observedAt?: string
}

export const authApi = {
  register: (username: string, email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/register', { username, email, password }),
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { email, password }),
}

export const observationsApi = {
  getAll: () => api.get<Observation[]>('/api/observations'),
  getById: (id: number) => api.get<Observation>(`/api/observations/${id}`),
  create: (payload: CreateObservationPayload) =>
    api.post<Observation>('/api/observations', payload),
  update: (id: number, payload: CreateObservationPayload) =>
    api.put<Observation>(`/api/observations/${id}`, payload),
  delete: (id: number) => api.delete(`/api/observations/${id}`),
}

export default api
