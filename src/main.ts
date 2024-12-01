import { createApp } from 'vue'
import App from './App.vue'
import SortableTableHeader from './components/SortableTableHeader.vue'

const app = createApp(App)
app.component('SortableTableHeader', SortableTableHeader)
app.mount('#app')
