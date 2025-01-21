<template>
  <FormContainerComp
    btn-label="Login"
    :btn-handle="handleLogin"
    :alert="alert"
    name="Login"
  >
    <FormTextInputComp
      name="Email"
      placeholder="name@email.com"
      v-model="input.email"
      type="text"
      :alert="alert"
      object="account"
    ></FormTextInputComp>
    <FormTextInputComp
      name="Password"
      placeholder="Enter password"
      icon="key_vertical"
      v-model="input.password"
      :alert="alert"
      type="password"
      object="password"
      :sub-btn-click="forgetPasswordClick"
    >
      Forgot password?
    </FormTextInputComp>
  </FormContainerComp>
</template>

<script setup lang="ts">
import { apiErrorHandler, authRequest, alert } from '@/auth.service';
import FormContainerComp from '@/components/FormContainerComp.vue';
import FormTextInputComp from '@/components/FormTextInputComp.vue';
import { IBaseUserEmail, IUserAuthentication } from 'project-w-backend';
import { reactive } from 'vue';

const input = reactive<IUserAuthentication & IBaseUserEmail>({
    email: '',
    password: '',
  }),
  handleLogin = () => apiErrorHandler(authRequest('login', input)),
  forgetPasswordClick = () =>
    apiErrorHandler(authRequest('change-password', input));
</script>
