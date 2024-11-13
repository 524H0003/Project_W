<template>
  <div class="form-control mb-2">
    <label class="label -mb-1.5">
      <span class="label-text">{{ name }}</span>
    </label>
    <label
      class="input input-bordered flex items-center gap-2 relative"
      :class="{
        'input-error': object === alert?.object && alert?.type === 'error',
        'input-success': object === alert?.object && alert?.type === 'success',
      }"
    >
      <IconComp name="event" />
      <input
        id="datepicker-orientation"
        datepicker
        datepicker-orientation="top left"
        type="text"
        placeholder="Select date"
        v-model="model"
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
  <label v-if="subBtnClick" class="label -mt-3">
    <a href="#" class="label-text-alt link link-hover" @click="subBtnClick">
      <slot />
    </a>
  </label>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { initFlowbite } from 'flowbite'
import type { IAlert, IObject } from '@/auth.service'
import IconComp from '@/components/IconComp.vue'

onMounted(() => {
  initFlowbite()
})

const model = defineModel()
defineProps<{
  name: string
  object?: IObject
  subBtnClick?: () => void
  alert?: IAlert
  icon?: string
  placeholder?: string
  disable?: boolean
}>()
</script>
