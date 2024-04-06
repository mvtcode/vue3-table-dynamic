<template>
  <button class="btn-cta">{{ text }}</button>
</template>

<script setup lang="ts">

defineProps<{ text: string }>()

</script>

<style scoped>
</style>