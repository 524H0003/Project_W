<template>
  <FormContainerComp
    btn-label="Sign up"
    name="Employee sign up"
    :btn-handle="handleSignUp"
    :alert="alert"
  >
    <FormTextInputComp
      name="Email"
      placeholder="name@email.com"
      v-model="input.email"
      type="text"
      :alert="alert"
      object="account"
    />
    <FormTextInputComp
      name="Name"
      placeholder="Full name"
      icon="account_circle"
      type="text"
      v-model="input.name"
    />
    <FormSelectInputComp
      name="Position"
      object="role"
      :alert="alert"
      v-model="input.position"
      :list="new Map(Object.entries(EmployeePosition))"
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
      name="Enterprise name"
      placeholder="Your company name"
      icon="work"
      type="text"
      :alert="alert"
      object="enterprise"
      v-model="inputRequest.enterpriseName"
    />
    <FormTextInputComp
      name="Signature"
      placeholder="Please send request"
      icon="signature"
      type="text"
      v-model="input.signature"
      :alert="alert"
      object="signature"
      :sub-btn-click="request"
    >
      Request signature
    </FormTextInputComp>
  </FormContainerComp>
</template>

<script setup lang="ts">
import { action, alert, apiErrorHandler } from '@/auth.service';
import FormContainerComp from '@/components/FormContainerComp.vue';
import FormSelectInputComp from '@/components/FormSelectInputComp.vue';
import FormTextInputComp from '@/components/FormTextInputComp.vue';
import {
  EmployeePosition,
  IEmployeeHook,
  IEmployeeSignUp,
  ISignature,
} from 'project-w-backend';
import { reactive } from 'vue';

const input = reactive<IEmployeeSignUp & ISignature>({
    signature: '',
    position: EmployeePosition['Other'],
    password: '',
    name: '',
    email: '',
  }),
  inputRequest = reactive<IEmployeeHook>({
    enterpriseName: '',
    email: '',
    name: '',
    position: EmployeePosition['Other'],
  }),
  handleSignUp = () => apiErrorHandler(action(input)),
  request = () =>
    apiErrorHandler(
      action('EmployeeSignUp', {
        ...inputRequest,
        email: input.email,
        name: input.name,
        position: input.position,
      }),
    );
</script>
