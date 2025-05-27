import { ApiResponse, get, post } from '@/src/utils/request'

export async function login(email: string, password: string) {
  return post<{ access: string, refresh: string }>(
    '/accounts/login',
    {
      email,
      password,
    }
  )
}

export async function getUserInfo() {
  return get<any>('/accounts/profile')
}

export async function logout() {
  return post('/accounts/logout')
}

export async function register(data: { email: string, password: string, password2: string, phone: string, username: string }) {
  return post('/accounts/register', data)
}

export async function refreshToken(refreshToken: string) {
  return post('/accounts/login/refresh', { refresh: refreshToken })
}