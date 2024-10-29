<template>
  <span class="material-icons aspect-square h-6 w-6">{{ name }}</span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    name: { type: String, required: true },
  },
})
</script>
