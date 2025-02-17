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
  </FormContainerComp>
</template>

<script setup lang="ts">
import { action, alert, apiErrorHandler } from '@/auth.service';
import FormContainerComp from '@/components/FormContainerComp.vue';
import FormTextInputComp from '@/components/FormTextInputComp.vue';
import { IFacultyAssign, ISignature } from 'project-w-backend';
import { reactive } from 'vue';

const input = reactive<IFacultyAssign & ISignature>({
    signature: '',
    department: '',
    password: '',
    name: '',
    email: '',
  }),
  handleAssign = () => apiErrorHandler(action('FacultyAssign', input));
</script>
