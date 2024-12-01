<template>
  <th @click="toggleSort" class="sortable-header" :class="{ active: isActive }">
    {{ label }}
    <span class="sort-icon" v-if="isActive">
      {{ sortDirection === 'asc' ? '↑' : '↓' }}
    </span>
  </th>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  currentSort: string | null
  currentDirection: 'asc' | 'desc' | null
  column: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'sort', column: string, direction: 'asc' | 'desc'): void
}>()

const isActive = computed(() => props.currentSort === props.column)
const sortDirection = computed(() => props.currentDirection)

const toggleSort = () => {
  const newDirection = !isActive.value || sortDirection.value === 'desc' ? 'asc' : 'desc'
  emit('sort', props.column, newDirection)
}
</script>

<style scoped>
.sortable-header {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: 20px;
}

.sortable-header:hover {
  background-color: #f5f5f5;
}

.sort-icon {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
}

.active {
  background-color: #f0f0f0;
}
</style>
