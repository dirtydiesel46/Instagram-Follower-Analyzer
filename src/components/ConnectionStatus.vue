<template>
  <Transition name="fade">
    <div
      v-if="!isOnline || !isWsConnected || !isDevServerConnected"
      :class="['connection-banner', status.type]"
    >
      <div class="connection-content">
        <span class="connection-icon">{{ status.icon }}</span>
        <span class="connection-message">{{ status.message }}</span>
        <button v-if="status.canRetry" class="retry-button" @click="handleRetry">
          {{ status.retryText }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const isOnline = ref(navigator.onLine)
const isDevServerConnected = ref(true)
const isWsConnected = ref(true)
const retryAttempts = ref(0)
const maxRetryAttempts = 3

let wsReconnectTimer: number | null = null

const handleConnectionChange = () => {
  isOnline.value = navigator.onLine
}

const setupWebSocketMonitoring = () => {
  if (import.meta.hot) {
    import.meta.hot.on('vite:beforeUpdate', () => {
      isDevServerConnected.value = true
      isWsConnected.value = true
    })

    import.meta.hot.on('vite:error', (err: unknown) => {
      if (typeof err === 'string' && err.includes('WebSocket')) {
        isWsConnected.value = false
        attemptWsReconnect()
      } else {
        isDevServerConnected.value = false
      }
    })

    // Monitor WebSocket connection status
    const wsUrl = `ws://${window.location.hostname}:${window.location.port}`
    const checkWsConnection = () => {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        isWsConnected.value = true
        retryAttempts.value = 0
        if (wsReconnectTimer) {
          clearTimeout(wsReconnectTimer)
          wsReconnectTimer = null
        }
      }

      ws.onclose = () => {
        isWsConnected.value = false
        attemptWsReconnect()
      }

      ws.onerror = () => {
        isWsConnected.value = false
        ws.close()
      }
    }

    checkWsConnection()
  }
}

const attemptWsReconnect = () => {
  if (retryAttempts.value < maxRetryAttempts && !wsReconnectTimer) {
    wsReconnectTimer = window.setTimeout(() => {
      retryAttempts.value++
      setupWebSocketMonitoring()
      wsReconnectTimer = null
    }, 3000) // Retry every 3 seconds
  }
}

const handleRetry = () => {
  if (!isOnline.value) {
    window.location.reload()
  } else if (!isWsConnected.value) {
    retryAttempts.value = 0
    setupWebSocketMonitoring()
  } else if (!isDevServerConnected.value) {
    if (import.meta.hot) {
      import.meta.hot.send('vite:reconnect')
    }
  }
}

const status = computed(() => {
  if (!isOnline.value) {
    return {
      type: 'error',
      icon: '📡',
      message: 'You are offline. Please check your internet connection.',
      retryText: 'Check Connection',
      canRetry: true,
    }
  }
  if (!isWsConnected.value) {
    return {
      type: 'warning',
      icon: '🔄',
      message: `Live reload connection lost. ${retryAttempts.value < maxRetryAttempts ? 'Attempting to reconnect...' : 'Please refresh the page.'}`,
      retryText: 'Retry Connection',
      canRetry: true,
    }
  }
  if (!isDevServerConnected.value) {
    return {
      type: 'warning',
      icon: '🔌',
      message: 'Development server disconnected. Trying to reconnect...',
      retryText: 'Retry Connection',
      canRetry: true,
    }
  }
  return {
    type: 'success',
    icon: '✅',
    message: 'Connected',
    retryText: '',
    canRetry: false,
  }
})

const isConnected = computed(
  () => isOnline.value && isWsConnected.value && isDevServerConnected.value,
)

// Emit connection state changes
watch(isConnected, (value) => {
  emit('connection-change', value)
})

const emit = defineEmits<{
  'connection-change': [boolean]
}>()

onMounted(() => {
  window.addEventListener('online', handleConnectionChange)
  window.addEventListener('offline', handleConnectionChange)
  setupWebSocketMonitoring()
})

onUnmounted(() => {
  window.removeEventListener('online', handleConnectionChange)
  window.removeEventListener('offline', handleConnectionChange)
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer)
  }
})
</script>

<style scoped>
/* ... previous styles remain the same ... */

.warning {
  background-color: #ff9800;
  color: white;
}

/* Add a pulsing animation for the warning state */
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}

.warning .connection-icon {
  animation: pulse 2s infinite;
}
</style>
