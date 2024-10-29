<template>
  <div class="bg-base-200 flex items-center justify-center min-h-screen">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="card-title text-4xl font-bold">Login</h1>
        <form>
          <FormTextInputComp
            name="Email"
            placeholder="name@email.com"
          ></FormTextInputComp>
          <FormTextInputComp
            name="Password"
            placeholder="Enter password"
            icon="key_vertical"
          ></FormTextInputComp>
          <label class="label">
            <a href="#" class="label-text-alt link link-hover">
              Forgot password?
            </a>
          </label>
          <div class="form-control mt-3">
            <button class="btn btn-primary">Login</button>
          </div>
        </form>
        <div class="divider">OR</div>
        <div class="text-center">
          <p>Don't have an account?</p>
          <RouterLink to="/signup" class="link link-primary">
            Sign up now
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FormTextInputComp from '@/components/FormTextInputComp.vue'
import { RouterLink } from 'vue-router'
</script>
