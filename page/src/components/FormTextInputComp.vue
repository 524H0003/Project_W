<template>
  <div class="form-control mb-2">
    <label class="label -mb-1.5">
      <span class="label-text">{{ name }}</span>
    </label>
    <label
      class="input input-bordered flex items-center gap-2"
      :class="{ 'input-error': error, 'input-success': success }"
    >
      <IconComp :name="(icon || name || '').toLowerCase()"></IconComp>
      <input
        :type="type || name"
        class="grow"
        :placeholder="placeholder || name"
        v-model="model"
        :disabled="disable"
      />
    </label>
    <label class="label -mt-1.5">
      <span
        class="label-text-alt"
        :class="{
          'text-green-700': success,
          'text-red-700': error,
        }"
        >{{ error || success }}</span
      >
    </label>
  </div>
</template>

<script setup lang="ts">
import IconComp from '@/components/IconComp.vue'

const model = defineModel()
defineProps<{
  name: string
  error?: string | null
  success?: string | null
  icon?: string
  placeholder?: string
  type?: string
  disable?: boolean
}>()
</script>
