<template>
  <FormContainerComp
    btn-label="Send"
    :btn-handle="handleLogin"
    :alert="alert"
    name="Request signature"
  >
  </FormContainerComp>
</template>

<script setup lang="ts">
import { apiErrorHandler, authRequest, alert } from '@/auth.service';
import FormContainerComp from '@/components/FormContainerComp.vue';

const handleLogin = () => apiErrorHandler(authRequest('request-signature'));
</script>
