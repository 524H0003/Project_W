<template>
  <FormContainerComp
    btn-label="Confirm"
    :btn-handle="handleHook"
    :alert="alert"
  >
    <FormTextInputComp
      name="Signature"
      v-model="$route.params.signature"
      :disable="true"
      object="signature"
      :alert="alert"
    ></FormTextInputComp>
    <FormTextInputComp
      name="New Password"
      placeholder="Enter password"
      icon="key_vertical"
      v-model="input.password"
      :alert="alert"
      object="password"
    ></FormTextInputComp>
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
  handleHook = () =>
    apiErrorHandler(
      hookRequest(route.params.signature as string, input.password),
    )
</script>
