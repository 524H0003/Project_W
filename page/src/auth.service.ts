import axios from 'axios'
import type { ISignUp, IUserAuthentication } from 'project-w-backend'
import { reactive } from 'vue'

const API_URL = './api/v1',
  state = reactive<AuthState>({
    user: null,
    token: null,
  })

interface AuthState {
  user: null | { email: string }
  token: null | string
}

function authLogin(user: Required<IUserAuthentication>) {
  return axios.post(`${API_URL}/login`, user)
}

function authSignUp(user: ISignUp) {
  return axios.post(`${API_URL}/signup`, user)
}

export const useAuth = () => {
  const login = async (user: Required<IUserAuthentication>) => {
    const response = await authLogin(user)
    state.user = response.data.user
    state.token = response.data.token
    localStorage.setItem('token', state.token!) // Store token in local storage
  }

  const logout = async () => {
    await axios.post(`${API_URL}/logout`)
    state.user = state.token = null
    localStorage.removeItem('token') // Remove token from local storage
  }

  const signUp = async (user: ISignUp) => {
    const response = await authSignUp(user)
    state.user = response.data.user
    state.token = response.data.token
    localStorage.setItem('token', state.token!)
  }

  return {
    state,
    login,
    logout,
    signUp,
  }
}
