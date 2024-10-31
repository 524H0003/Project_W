<template>
  <div class="form-control mb-2">
    <label class="label">
      <span class="label-text -mb-1.5">{{ name }}</span>
    </label>
    <label class="input input-bordered flex items-center gap-2">
      <IconComp :name="(icon || name || '').toLowerCase()"></IconComp>
      <input
        :type="type || name"
        class="grow"
        :placeholder="placeholder || name"
        v-model="model"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import IconComp from '@/components/IconComp.vue'

const model = defineModel()
defineProps<{
  name: string
  icon?: string
  placeholder?: string
  type?: string
}>()
</script>
