<template>
  <div v-html="markdown.render(`../../ReadMe.md`)"></div>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt();
</script>
