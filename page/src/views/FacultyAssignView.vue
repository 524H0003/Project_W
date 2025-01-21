<template>
  <FormContainerComp
    btn-label="Assign"
    :btn-handle="handleAssign"
    name="Faculty assign"
    :alert="alert"
  >
    <FormTextInputComp
      name="Email"
      placeholder="name@email.com"
      type="text"
      :alert="alert"
      object="account"
      v-model="input.email"
    />
    <FormTextInputComp
      name="Department"
      v-model="input.department"
      icon="domain"
      type="text"
    />
    <FormTextInputComp
      name="Name"
      v-model="input.name"
      icon="person"
      type="text"
    />
    <FormTextInputComp
      name="Password"
      placeholder="Enter your password"
      icon="key_vertical"
      type="password"
      :alert="alert"
      object="password"
      v-model="input.password"
    />
    <FormTextInputComp
      name="Signature"
      placeholder="Please send request to console"
      icon="signature"
      type="text"
      v-model="input.signature"
      :alert="alert"
      object="signature"
      :sub-btn-click="request"
    >
      Request signature from console
    </FormTextInputComp>
  </FormContainerComp>
</template>

<script setup lang="ts">
import {
  alert,
  apiErrorHandler,
  assignFaculty,
  requestConsole,
} from '@/auth.service';
import FormContainerComp from '@/components/FormContainerComp.vue';
import FormTextInputComp from '@/components/FormTextInputComp.vue';
import { IFacultyAssign } from 'project-w-backend';
import { reactive } from 'vue';

const input = reactive<IFacultyAssign>({
    signature: '',
    department: '',
    password: '',
    name: '',
    email: '',
  }),
  handleAssign = () => apiErrorHandler(assignFaculty(input)),
  request = () => apiErrorHandler(requestConsole());
</script>
