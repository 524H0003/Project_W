<template>
  <div class="bg-base-200 flex items-center justify-center min-h-screen">
    <div
      class="iw-sm:ih-sm:card iw-sm:ih-sm:max-w-[500px] iw-sm:ih-sm:max-h-[80vh] iw-sm:ih-sm:min-h-0 min-h-screen w-dvw bg-base-100 shadow-xl ah-sm:screen-center aw-sm:screen-center overflow-y-auto"
    >
      <div class="card-body flex items-center justify-center">
        <div class="w-full">
          <h1 class="card-title text-4xl font-bold">{{ name }}</h1>
          <form @submit.prevent="btnHandle">
            <slot />
            <div class="form-control mt-6">
              <button
                class="btn btn-primary w-full"
                :disabled="alert.type == 'processing'"
              >
                <span
                  v-if="alert.type == 'processing'"
                  class="loading loading-spinner"
                ></span>
                {{ btnLabel }}
              </button>
              <div class="label -my-1.5" v-if="alert.object == 'api'">
                <span
                  class="label-text-alt"
                  :class="{
                    'text-green-700': alert?.type === 'success',
                    'text-red-700': alert?.type === 'error',
                  }"
                >
                  {{ alert.message }}
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IAlert } from '@/auth.service';

defineProps<{
  name: string;
  btnLabel: string;
  alert: IAlert;
  btnHandle: () => void;
}>();
</script>
