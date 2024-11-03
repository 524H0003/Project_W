<template>
  <div class="form-control mb-2">
    <label class="label -mb-1.5">
      <span class="label-text">{{ name }}</span>
    </label>
    <label
      class="input input-bordered flex items-center gap-2"
      :class="{
        'input-error': object === alert?.object && alert?.type === 'error',
        'input-success': object === alert?.object && alert?.type === 'success',
      }"
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
    <label v-if="object === alert?.object" class="label -my-1.5">
      <span
        class="label-text-alt"
        :class="{
          'text-green-700': alert?.type === 'success',
          'text-red-700': alert?.type === 'error',
        }"
      >
        {{ alert?.message }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import type { IAlert, IObject } from '@/auth.service'
import IconComp from '@/components/IconComp.vue'

const model = defineModel()
defineProps<{
  name: string
  object?: IObject
  alert?: IAlert
  icon?: string
  placeholder?: string
  type?: string
  disable?: boolean
}>()
</script>
