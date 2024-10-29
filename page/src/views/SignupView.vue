<template>
  <div class="bg-base-200 flex items-center justify-center min-h-screen">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="card-title text-4xl font-bold">Sign up</h1>
        <form>
          <FormTextInputComp
            name="Email"
            placeholder="name@email.com"
          ></FormTextInputComp>
          <FormTextInputComp
            name="Password"
            placeholder="Enter password"
            icon="key"
          ></FormTextInputComp>
          <FormTextInputComp
            name="Confirm password"
            placeholder="Re-enter password"
            icon="sync_lock"
          ></FormTextInputComp>
          <div class="form-control mt-3">
            <button class="btn btn-primary">Confirm</button>
          </div>
        </form>
        <div class="divider">OR</div>
        <div class="text-center">
          <p>Already have an account?</p>
          <RouterLink to="/login" class="link link-primary"> Login </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FormTextInputComp from '@/components/FormTextInputComp.vue'
import { RouterLink } from 'vue-router'
</script>
