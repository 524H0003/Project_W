import axios from 'axios'
import type {
  IUserAuthentication,
  IUserInfo,
  IUserRecieve,
} from 'project-w-backend'
import { reactive } from 'vue'

const API_URL = '/api/v1'

export const alert = reactive<IAlert>({
    error: { password: '', account: '' },
    success: { password: '', account: '' },
  }),
  state = reactive<AuthState>({ user: null, token: null })

interface AuthState {
  user: null | IUserInfo | string
  token: null | IUserRecieve
}

export async function authRequest(
  type: 'login' | 'signup' | 'logout' | 'change',
  user?: Required<IUserAuthentication>,
) {
  const response = await axios.post(`${API_URL}/${type}`, user)
  state.user = response.data.user
  saveTokens(response.data.session)
  return response.data.user
}

export async function hookRequest(signature: string, password: string) {
  const response = await axios.post(`${API_URL}/change/${signature}`, {
    password,
  })
  return response.data.user
}

function saveTokens(input: IUserRecieve) {
  state.token = input
  localStorage.setItem('acsTkn', state.token!.accessToken)
  localStorage.setItem('rfsTkn', state.token!.refreshToken)
}

export interface IAlertObject {
  password: string | null
  account: string | null
}

export interface IAlert {
  error: IAlertObject
  success: IAlertObject
}

export async function apiErrorHandler<T>(func: Promise<T>) {
  alert.error = alert.success = { password: null, account: null }
  try {
    const response = await func
    if (typeof response == 'string') {
      switch (response) {
        case 'Request_Signature_From_Email':
          alert.error.account =
            'An email has sent to your email address, please check inbox and spam'
          break

        case 'Success_Change_Password':
          alert.success.password = 'Password changed successfully'
          break

        default:
          break
      }
    }
  } catch (e) {
    switch (
      (e as { response: { data: { message: string } } }).response.data.message
    ) {
      case 'Invalid_Password':
        alert.error.password = 'Wrong password, please re-enter your password'
        break

      case 'Invalid_Email':
        alert.error.account = 'Email not found, please re-enter your email'
        break

      default:
        break
    }
  }
}
