import axios from 'axios'

const API_URL = './api/v1' // Replace with your API URL

export const register = async (email: string, password: string) => {
  return await axios.post(`${API_URL}/signup`, { email, password })
}

export const login = async (email: string, password: string) => {
  return await axios.post(`${API_URL}/login`, { email, password })
}
