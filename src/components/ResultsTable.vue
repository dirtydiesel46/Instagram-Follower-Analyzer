<template>
  <div class="results-container" v-if="results.length">
    <h2>Users Not Following Back ({{ results.length }})</h2>
    <div class="table-controls">
      <input type="text" v-model="searchQuery" placeholder="Search users..." class="search-input" />
      <select v-model="sortBy" class="sort-select">
        <option value="recent">Most Recent First</option>
        <option value="oldest">Oldest First</option>
        <option value="username">Username A-Z</option>
      </select>
    </div>
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Profile</th>
          <th>Followed Since</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredAndSortedResults" :key="user.username">
          <td>{{ user.username }}</td>
          <td>
            <a :href="user.profileUrl" target="_blank">View Profile</a>
          </td>
          <td>{{ formatDate(user.followedSince) }}</td>
          <td>
            <button @click="copyProfileUrl(user.profileUrl)" class="action-button">Copy URL</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="no-results">
    No results to display. Please upload your data and analyze first.
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ComparisonResult } from '../types/instagram'

const props = defineProps<{
  results: ComparisonResult[]
}>()

const searchQuery = ref('')
const sortBy = ref('recent')

const filteredAndSortedResults = computed(() => {
  let results = [...props.results]

  // Filter by search query
  if (searchQuery.value) {
    results = results.filter((user) =>
      user.username.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  // Sort results
  switch (sortBy.value) {
    case 'recent':
      results.sort((a, b) => b.followedSince.getTime() - a.followedSince.getTime())
      break
    case 'oldest':
      results.sort((a, b) => a.followedSince.getTime() - b.followedSince.getTime())
      break
    case 'username':
      results.sort((a, b) => a.username.localeCompare(b.username))
      break
  }

  return results
})

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const copyProfileUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    alert('Profile URL copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy URL:', err)
  }
}
</script>

<style scoped>
.results-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
}

.table-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input,
.sort-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-input {
  flex: 1;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background: #f8f9fa;
  font-weight: 600;
}

.action-button {
  padding: 0.5rem 1rem;
  background: #0366d6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
