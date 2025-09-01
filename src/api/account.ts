import request, { ApiResponse, WhiteList } from '@/src/utils/request';

export async function login(email: string, password: string) {
  return request.post<ApiResponse<{ access: string, refresh: string }>>(
    WhiteList.login,
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
  try {
    const res = await request.post('/accounts/logout', { refresh_token: refreshToken });
    // 205也视为成功
    if (res?.status === 205 || res?.status === 200) {
      return Promise.resolve(res);
    }
    throw new Error('Logout failed');
  } catch (error: any) {
    // axios/fetch错误时，捕获205也视为成功
    if (error?.response?.status === 205) {
      return Promise.resolve(error.response);
    }
    throw Promise.reject(error);
  }
}

export async function register(data: { email: string, password: string, password2: string, phone: string, username: string }) {
  return request.post(WhiteList.register, data)
}

export async function sendVerificationCode({ email }: { email: string }) {
  return request.post<ApiResponse<undefined>>(WhiteList.sendCode, { email })
}

export async function verifyCode({ email, code }: { email: string, code: string }) {
  return request.post<ApiResponse<undefined>>(WhiteList.verifyCode, { email, code })
}