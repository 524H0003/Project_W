<template>
  <FormContainerComp
    btn-label="Sign up"
    name="Employee sign up"
    :alert="alert"
    :btn-handle="handleSignUp"
  ></FormContainerComp>
</template>

<script setup lang="ts">
import { alert, apiErrorHandler, assignEnterpriseUser } from '@/auth.service'
import FormContainerComp from '@/components/FormContainerComp.vue'
import type { IEmployeeSignup } from 'project-w-backend/enterprise/employee/employee.model'
import { reactive } from 'vue'

const input = reactive<IEmployeeSignup>({
    signature: '',
    position: EmployeePosition.other,
  }),
  handleSignUp = () => apiErrorHandler(assignEnterpriseUser(input))
</script>
