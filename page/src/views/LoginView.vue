<template>
  <FormContainerComp btn-label="Login" :btn-handle="handleLogin" :alert="alert">
    <FormTextInputComp
      name="Email"
      placeholder="name@email.com"
      v-model="input.email"
      :alert="alert"
      object="account"
    ></FormTextInputComp>
    <FormTextInputComp
      name="Password"
      placeholder="Enter password"
      icon="key_vertical"
      v-model="input.password"
      :alert="alert"
      object="password"
    ></FormTextInputComp>
    <label class="label -mt-3">
      <a
        href="#"
        class="label-text-alt link link-hover"
        @click="forgetPasswordClick"
      >
        Forgot password?
      </a>
    </label>
  </FormContainerComp>
</template>

<script setup lang="ts">
import { apiErrorHandler, authRequest, alert } from '@/auth.service'
import FormContainerComp from '@/components/FormContainerComp.vue'
import FormTextInputComp from '@/components/FormTextInputComp.vue'
import type { IBaseUserEmail, IUserAuthentication } from 'project-w-backend'
import { reactive } from 'vue'

const input = reactive<IUserAuthentication & IBaseUserEmail>({
    email: '',
    password: '',
  }),
  handleLogin = () => apiErrorHandler(authRequest('login', input)),
  forgetPasswordClick = () => apiErrorHandler(authRequest('change', input))
</script>
