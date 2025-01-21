<template>
  <span class="material-symbols-outlined aspect-square">{{ name }}</span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    name: { type: String, required: true },
  },
});
</script>
