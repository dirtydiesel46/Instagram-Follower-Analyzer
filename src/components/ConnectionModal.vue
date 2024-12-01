<template>
  <Transition name="modal-fade">
    <div v-if="!isConnected" class="modal-overlay">
      <div role="dialog" class="modal-content">
        <div class="modal-header">
          <span class="status-icon">{{ status.icon }}</span>
          <h3>{{ status.title }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ status.message }}</p>
        </div>
        <div class="modal-footer">
          <button v-if="status.canRetry" @click="handleRetry" class="retry-button">
            {{ status.retryText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)
const isWsConnected = ref(true)
const isDevServerConnected = ref(true)
const retryAttempts = ref(0)
const maxRetryAttempts = 3

let wsReconnectTimer: number | null = null
let ws: WebSocket | null = null

const handleConnectionChange = () => {
  isOnline.value = navigator.onLine
}

const cleanupWebSocket = () => {
  if (ws) {
    ws.close()
    ws = null
  }
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer)
    wsReconnectTimer = null
  }
}

const checkWsConnection = () => {
  cleanupWebSocket() // Cleanup any existing connection first

  // Use Vite's client protocol and path
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.hostname}:${window.location.port}/__vite_hmr`

  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.log('WebSocket connected')
    isWsConnected.value = true
    isDevServerConnected.value = true
    retryAttempts.value = 0

    // Send ping to verify connection
    ws?.send(JSON.stringify({ type: 'ping' }))
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'connected') {
      console.log('HMR connection confirmed')
      isWsConnected.value = true
      isDevServerConnected.value = true
    }
  }

  ws.onclose = () => {
    console.log('WebSocket closed')
    isWsConnected.value = false
    ws = null
    attemptWsReconnect()
  }

  ws.onerror = (error) => {
    console.log('WebSocket error:', error)
    isWsConnected.value = false
    cleanupWebSocket()
  }
}

const setupWebSocketMonitoring = () => {
  if (import.meta.hot) {
    import.meta.hot.on('vite:beforeUpdate', () => {
      isDevServerConnected.value = true
      isWsConnected.value = true
    })

    import.meta.hot.on('vite:error', (err: unknown) => {
      console.log('Vite error:', err)
      isDevServerConnected.value = false
      if (typeof err === 'string' && err.includes('WebSocket')) {
        isWsConnected.value = false
        attemptWsReconnect()
      }
    })

    // Listen for Vite client connection status
    import.meta.hot.on('vite:ws:disconnect', () => {
      isWsConnected.value = false
      attemptWsReconnect()
    })

    import.meta.hot.on('vite:ws:connect', () => {
      isWsConnected.value = true
      isDevServerConnected.value = true
      retryAttempts.value = 0
    })

    checkWsConnection()
  }
}

const attemptWsReconnect = () => {
  if (retryAttempts.value < maxRetryAttempts && !wsReconnectTimer) {
    console.log(`Attempting reconnect ${retryAttempts.value + 1}/${maxRetryAttempts}`)
    wsReconnectTimer = window.setTimeout(() => {
      retryAttempts.value++

      // Try to reconnect to Vite's HMR server
      if (import.meta.hot) {
        import.meta.hot.send('vite:reconnect')
      }

      checkWsConnection() // Also try direct WebSocket connection
      wsReconnectTimer = null
    }, 1000)
  } else if (retryAttempts.value >= maxRetryAttempts) {
    console.log('Max retry attempts reached')
    cleanupWebSocket()
  }
}

const handleRetry = () => {
  console.log('Retry clicked')
  if (!isOnline.value) {
    window.location.reload()
  } else {
    // Reset attempts and try immediate reconnection
    retryAttempts.value = 0
    cleanupWebSocket()

    // Try to reconnect to Vite's HMR server
    if (import.meta.hot) {
      import.meta.hot.send('vite:reconnect')

      // Force a full reload if needed
      setTimeout(() => {
        if (!isWsConnected.value) {
          window.location.reload()
        }
      }, 2000)
    }

    checkWsConnection()
  }
}

onMounted(() => {
  window.addEventListener('online', handleConnectionChange)
  window.addEventListener('offline', handleConnectionChange)
  setupWebSocketMonitoring()
})

onUnmounted(() => {
  window.removeEventListener('online', handleConnectionChange)
  window.removeEventListener('offline', handleConnectionChange)
  cleanupWebSocket()
})

const isConnected = computed(
  () => isOnline.value && isWsConnected.value && isDevServerConnected.value,
)

const status = computed(() => {
  if (!isOnline.value) {
    return {
      icon: '📡',
      title: 'You are Offline',
      message: 'Please check your internet connection and try again.',
      retryText: 'Check Connection',
      type: 'error',
      canRetry: true,
    }
  }
  if (!isWsConnected.value) {
    return {
      icon: '🔄',
      title: 'Live Reload Disconnected',
      message: `Development server connection lost. ${
        retryAttempts.value < maxRetryAttempts
          ? 'Attempting to reconnect...'
          : 'Please refresh the page.'
      }`,
      retryText: 'Retry Connection',
      type: 'warning',
      canRetry: true,
    }
  }
  if (!isDevServerConnected.value) {
    return {
      icon: '🔌',
      title: 'Server Disconnected',
      message: 'Development server connection lost. Please wait while we try to reconnect...',
      retryText: 'Retry Connection',
      type: 'warning',
      canRetry: true,
    }
  }
  return {
    icon: '✅',
    title: 'Connected',
    message: 'Connected to development server',
    retryText: '',
    canRetry: false,
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.status-icon {
  font-size: 2rem;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.modal-body p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.modal-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #0056b3;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
