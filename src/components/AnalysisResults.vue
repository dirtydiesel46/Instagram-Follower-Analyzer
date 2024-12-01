<template>
  <div class="results-container">
    <div class="results-header">
      <h2>Instagram Follower Analysis</h2>
      <div class="stats-summary">
        <div class="stat-box">
          <span class="stat-icon">👥</span>
          <div class="stat-details">
            <span class="stat-label">Total Followers</span>
            <span class="stat-value" data-testid="total-followers">{{ analysis.followers.length }}</span>
          </div>
        </div>
        <div class="stat-box">
          <span class="stat-icon">👤</span>
          <div class="stat-details">
            <span class="stat-label">Total Following</span>
            <span class="stat-value" data-testid="total-following">{{ analysis.following.length }}</span>
          </div>
        </div>
        <div class="stat-box highlight">
          <span class="stat-icon">❗</span>
          <div class="stat-details">
            <span class="stat-label">Not Following Back</span>
            <span class="stat-value" data-testid="not-following-back">{{ analysis.notFollowingBack.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="results-content" data-testid="analysis-results">
      <div class="table-container">
        <h3>Users Not Following Back</h3>
        <table data-testid="results-table">
          <thead>
            <tr>
              <th>Username</th>
              <SortableTableHeader
                label="Followed At"
                :current-sort="sortColumn"
                :current-direction="sortDirection"
                column="followedAt"
                @sort="handleSort"
                data-testid="followed-at-header"
              />
              <th>Profile Link</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in sortedUsers" :key="user.username">
              <td>
                <span class="username">{{ user.username }}</span>
              </td>
              <td>{{ formatDate(user.followedAt) }}</td>
              <td>
                <a :href="user.profileUrl" target="_blank" class="profile-link">
                  View Profile
                  <span class="external-link-icon">↗</span>
                </a>
              </td>
              <td>
                <button @click="$emit('copy-url', user.profileUrl)" class="action-button">
                  Copy URL
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="results-footer">
      <button @click="$emit('download')" class="footer-button download-button">
        <span class="button-icon">💾</span>
        Download Analysis as JSON
      </button>
      <button @click="$emit('reset')" class="footer-button reset-button">
        <span class="button-icon">🔄</span>
        {{ mode === 'app' ? 'New Analysis' : 'Upload New Data' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FollowAnalysis } from '@/types/instagram'
import SortableTableHeader from './SortableTableHeader.vue'

const props = defineProps<{
  analysis: FollowAnalysis
  mode: 'app' | 'upload'
}>()

defineEmits<{
  (e: 'reset'): void
  (e: 'download'): void
  (e: 'copy-url', url: string): void
}>()

const sortColumn = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

const handleSort = (column: string, direction: 'asc' | 'desc') => {
  sortColumn.value = column
  sortDirection.value = direction
}

const sortedUsers = computed(() => {
  if (!sortColumn.value || !sortDirection.value) {
    return props.analysis.notFollowingBack
  }

  return [...props.analysis.notFollowingBack].sort((a, b) => {
    if (sortColumn.value === 'followedAt') {
      const dateA = new Date(a.followedAt).getTime()
      const dateB = new Date(b.followedAt).getTime()
      return sortDirection.value === 'asc' ? dateA - dateB : dateB - dateA
    }
    return 0
  })
})

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}
</script>

<style scoped>
.results-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.results-header {
  padding: 2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.results-header h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  text-align: center;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-box.highlight {
  background: #fff3cd;
  border: 1px solid #ffeeba;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.results-content {
  padding: 2rem;
}

.table-container {
  margin-top: 1rem;
}

.table-container h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

td {
  color: #444;
}

.username {
  font-weight: 500;
}

.profile-link {
  color: #007bff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.external-link-icon {
  font-size: 0.875rem;
}

.action-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: #f8f9fa;
  border-color: #ccc;
}

.results-footer {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #eee;
}

.footer-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-button {
  background: #28a745;
  color: white;
}

.download-button:hover {
  background: #218838;
}

.reset-button {
  background: #dc3545;
  color: white;
}

.reset-button:hover {
  background: #c82333;
}

.button-icon {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .stats-summary {
    grid-template-columns: 1fr;
  }

  .results-footer {
    flex-direction: column;
    gap: 1rem;
  }

  .footer-button {
    width: 100%;
    justify-content: center;
  }
}

th {
  padding: 1rem;
  text-align: left;
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
}

.date-column {
  min-width: 120px;
}
</style>
