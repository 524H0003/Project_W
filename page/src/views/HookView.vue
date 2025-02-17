<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <FormContainerComp
    btn-label="Confirm"
    :btn-handle="handleHook"
    :alert="alert"
    name="Change password"
  >
    <FormTextInputComp
      name="Signature"
      v-model="$route.params.signature"
      :disable="true"
      object="signature"
      :alert="alert"
      type="text"
    ></FormTextInputComp>
    <FormTextInputComp
      name="New Password"
      placeholder="Enter password"
      icon="key_vertical"
      v-model="input.password"
      :alert="alert"
      object="password"
      type="password"
    ></FormTextInputComp>
  </FormContainerComp>
</template>

<script setup lang="ts">
import { alert } from '@/auth.service';
import FormContainerComp from '@/components/FormContainerComp.vue';
import FormTextInputComp from '@/components/FormTextInputComp.vue';
import { IUserAuthentication } from 'project-w-backend';
import { reactive } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute(),
  input = reactive<IUserAuthentication>({
    password: '',
  }),
  handleHook = () => ({});
</script>
