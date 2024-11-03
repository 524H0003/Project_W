import axios from 'axios'
import type {
  IUserAuthentication,
  IUserInfo,
  IUserRecieve,
} from 'project-w-backend'
import { reactive } from 'vue'

const API_URL = '/api/v1'

export const alert = reactive<IAlert>({
    message: '',
    type: 'none',
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

export type IObject = 'account' | 'password' | 'signature'

export interface IAlert {
  message: string
  type: 'success' | 'error' | 'processing' | 'none'
  object?: IObject
}

export async function apiErrorHandler<T>(func: Promise<T>) {
  alert.message = ''
  alert.type = 'processing'

  try {
    const response = await func
    if (typeof response == 'string') {
      switch (response) {
        case 'Request_Signature_From_Email':
          alert.message =
            'An email has sent to your email address, please check inbox and spam'
          alert.type = 'error'
          alert.object = 'account'
          break

        case 'Success_Change_Password':
          alert.message = 'Password changed successfully'
          alert.type = 'success'
          alert.object = 'password'
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
        alert.message = 'Wrong password, please re-enter your password'
        alert.type = 'error'
        alert.object = 'password'
        break

      case 'Invalid_Email':
        alert.message = 'Email not found, please re-enter your email'
        alert.type = 'error'
        alert.object = 'account'
        break

      case 'Invalid_Hook_Signature':
      case 'Invalid_Hook_Cookie':
        alert.message =
          'Signature has been out of dated, please request new signature'
        alert.type = 'error'
        alert.object = 'signature'
        break

      default:
        break
    }
  }
}
