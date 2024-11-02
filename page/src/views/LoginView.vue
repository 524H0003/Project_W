<template>
  <FormContainerComp>
    <h1 class="card-title text-4xl font-bold">Login</h1>
    <form @submit.prevent="handleLogin">
      <FormTextInputComp
        name="Email"
        placeholder="name@email.com"
        v-model="input.email"
        :error="alert.error.account"
      ></FormTextInputComp>
      <FormTextInputComp
        name="Password"
        placeholder="Enter password"
        icon="key_vertical"
        v-model="input.password"
        :error="alert.error.password"
      ></FormTextInputComp>
      <label class="label">
        <a
          href="#"
          class="label-text-alt link link-hover"
          @click="forgetPasswordClick"
        >
          Forgot password?
        </a>
      </label>
      <div class="form-control mt-3">
        <button class="btn btn-primary">Login</button>
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
import { apiErrorHandler, authRequest, alert } from '@/auth.service'
import FormContainerComp from '@/components/FormContainerComp.vue'
import FormTextInputComp from '@/components/FormTextInputComp.vue'
import type { IBaseUserEmail, IUserAuthentication } from 'project-w-backend'
import { reactive } from 'vue'
import { RouterLink } from 'vue-router'

const input = reactive<IUserAuthentication & IBaseUserEmail>({
    email: '',
    password: '',
  }),
  handleLogin = () => apiErrorHandler(authRequest('login', input)),
  forgetPasswordClick = () => apiErrorHandler(authRequest('change', input))
</script>
