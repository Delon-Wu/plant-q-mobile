import request, { ApiResponse } from '@/src/utils/request'

export async function login(email: string, password: string) {
  return request.post<ApiResponse<{ access: string, refresh: string }>>(
    '/accounts/login',
    {
      email,
      password,
    }
  )
}

export async function getUserInfo() {
  return request.get<any>('/accounts/profile')
}

export async function logout(refreshToken: string) {
  return request.post('/accounts/logout', { refresh_token: refreshToken })
}

export async function register(data: { email: string, password: string, password2: string, phone: string, username: string }) {
  return request.post('/accounts/register', data)
}

export async function refreshToken(refreshToken: string) {
  return request.post<ApiResponse<{access: string}>>('/accounts/login/refresh', { refresh: refreshToken })
}