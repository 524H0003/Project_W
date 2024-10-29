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
      />
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import IconComp from '@/components/IconComp.vue'

export default defineComponent({
  props: {
    name: { type: String, required: true },
    icon: { type: String, required: false },
    placeholder: { type: String, required: false },
    type: { type: String, required: false },
  },
  components: { IconComp },
})
</script>
