<template>
  <FormContainerComp
    btn-label="Assign"
    :btn-handle="handleAssign"
    :alert="alert"
    name="Assign enterprise"
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
      name="Industry"
      icon="dictionary"
      type="text"
      v-model="input.industry"
    />
    <FormTextInputComp
      name="Name"
      placeholder="Company name"
      icon="work"
      type="text"
      v-model="input.name"
    />
    <FormTextInputComp
      name="Description"
      placeholder="General company bio"
      icon="description"
      v-model="input.description"
      type="text"
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
import { action, alert, apiErrorHandler } from '@/auth.service';
import FormContainerComp from '@/components/FormContainerComp.vue';
import FormTextInputComp from '@/components/FormTextInputComp.vue';
import { reactive } from 'vue';
import { IEnterpriseAssign, ISignature } from 'project-w-backend';

const input = reactive<IEnterpriseAssign & ISignature>({
    signature: '',
    description: '',
    industry: '',
    name: '',
    email: '',
  }),
  handleAssign = () => apiErrorHandler(action('EnterpriseAssign', input)),
  request = () => apiErrorHandler(requestConsole());
</script>
