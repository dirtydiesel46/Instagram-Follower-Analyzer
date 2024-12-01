<template>
  <div class="upload-container">
    <h2>Upload Instagram Data</h2>
    <div class="upload-boxes">
      <div class="upload-box">
        <h3>Followers Data</h3>
        <input type="file" accept=".json" @change="handleFollowersUpload" ref="followersInput" />
      </div>
      <div class="upload-box">
        <h3>Following Data</h3>
        <input type="file" accept=".json" @change="handleFollowingUpload" ref="followingInput" />
      </div>
    </div>
    <button @click="analyze" :disabled="!canAnalyze" class="analyze-button">Analyze</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { InstagramAnalyzer } from '../utils/instagram-analyzer'

const followersData = ref<any>(null)
const followingData = ref<any>(null)
const emit = defineEmits(['analysis-complete'])

const canAnalyze = computed(() => {
  return followersData.value && followingData.value
})

const handleFollowersUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const text = await file.text()
    followersData.value = JSON.parse(text)
  }
}

const handleFollowingUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const text = await file.text()
    followingData.value = JSON.parse(text)
  }
}

const analyze = () => {
  if (!canAnalyze.value) return

  const analyzer = new InstagramAnalyzer(
    followersData.value.relationships_followers || [],
    followingData.value.relationships_following || [],
  )

  const results = analyzer.getNonFollowingBack()
  emit('analysis-complete', results)
}
</script>

<style scoped>
.upload-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.upload-boxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

.upload-box {
  padding: 1.5rem;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.analyze-button {
  width: 100%;
  padding: 1rem;
  background: #0366d6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
}

.analyze-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
