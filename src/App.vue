<template>
  <div class="app">
    <ConnectionModal />
    <InstagramAnalyzer />
  </div>
</template>

<script setup lang="ts">
import InstagramAnalyzer from './components/InstagramAnalyzer.vue'
import ConnectionModal from './components/ConnectionModal.vue'
</script>

<style>
.app {
  font-family: Arial, sans-serif;
  padding: 20px;
}
</style>
