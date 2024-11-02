<template>
  <FormContainerComp>
    <h1 class="card-title text-4xl font-bold">Login</h1>
    <form @submit.prevent="handleLogin">
      <FormTextInputComp
        name="Email"
        placeholder="name@email.com"
        v-model="input.email"
        :error="appError.account"
      ></FormTextInputComp>
      <FormTextInputComp
        name="Password"
        placeholder="Enter password"
        icon="key_vertical"
        v-model="input.password"
        :error="appError.password"
      ></FormTextInputComp>
      <label class="label">
        <a href="#" class="label-text-alt link link-hover">
          Forgot password?
        </a>
      </label>
      <div class="form-control mt-3">
        <button class="btn btn-primary" @click="loginClick">Login</button>
      </div>
    </form>
    <div class="divider">OR</div>
    <div class="text-center">
      <p>Don't have an account?</p>
      <RouterLink to="/signup" class="link link-primary">
        Sign up now
      </RouterLink>
    </div>
  </FormContainerComp>
</template>

<script setup lang="ts">
import { useAuth } from '@/auth.service'
import FormContainerComp from '@/components/FormContainerComp.vue'
import FormTextInputComp from '@/components/FormTextInputComp.vue'
import type { IUserAuthentication } from 'project-w-backend'
import { reactive } from 'vue'
import { RouterLink } from 'vue-router'

interface IError {
  password: string
  account: string
}

const input = reactive<Required<IUserAuthentication>>({
    email: '',
    password: '',
  }),
  appError = reactive<IError>({ password: '', account: '' }),
  handleLogin = async () => {
    try {
      await useAuth().login(input)
    } catch (error) {
      switch (
        (error as { response: { data: { message: string } } }).response.data
          .message
      ) {
        case 'Invalid_Password':
          appError.password = 'Wrong password, please re-enter your password'
          break

        case 'Invalid_Email':
          appError.account = 'Email not found, please re-enter your email'
          break

        case 'Request_New_User':
          appError.account = 'Newly sign email, please check your email'
          break

        default:
          break
      }
    }
  },
  loginClick = () => {
    appError.account = appError.password = ''
  }
</script>
