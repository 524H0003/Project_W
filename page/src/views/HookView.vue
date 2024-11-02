<template>
  <FormContainerComp>
    <h1 class="card-title text-4xl font-bold">Change password</h1>
    <form @submit.prevent="handleLogin">
      <FormTextInputComp
        name="Signature"
        v-model="$route.params.signature"
        :disable="true"
      ></FormTextInputComp>
      <FormTextInputComp
        name="New Password"
        placeholder="Enter password"
        icon="key_vertical"
        v-model="input.password"
        :error="alert.error.password"
        :success="alert.success.password"
      ></FormTextInputComp>
      <div class="form-control mt-3">
        <button class="btn btn-primary">Confirm</button>
      </div>
    </form>
  </FormContainerComp>
</template>

<script setup lang="ts">
import { apiErrorHandler, hookRequest, alert } from '@/auth.service'
import FormContainerComp from '@/components/FormContainerComp.vue'
import FormTextInputComp from '@/components/FormTextInputComp.vue'
import type { IUserAuthentication } from 'project-w-backend'
import { reactive } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute(),
  input = reactive<Required<IUserAuthentication>>({
    password: '',
  }),
  handleLogin = () =>
    apiErrorHandler(
      hookRequest(route.params.signature as string, input.password),
    )
</script>
