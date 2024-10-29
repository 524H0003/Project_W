<template>
  <div class="bg-base-200 flex items-center justify-center min-h-screen">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="card-title text-4xl font-bold">Login</h1>
        <form>
          <LoginTextInputComp
            input="Email"
            placeholder="name@email.com"
          ></LoginTextInputComp>
          <LoginTextInputComp
            input="Password"
            placeholder="Enter password"
          ></LoginTextInputComp>
          <label class="label">
            <a href="#" class="label-text-alt link link-hover"
              >Forgot password?</a
            >
          </label>
          <div class="form-control mt-6">
            <button class="btn btn-primary">Login</button>
          </div>
        </form>
        <div class="divider">OR</div>
        <div class="text-center">
          <p>Don't have an account?</p>
          <a href="#" class="link link-primary">Sign up now</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginTextInputComp from '@/components/LoginTextInputComp.vue'
</script>
