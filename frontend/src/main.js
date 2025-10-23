import { createPinia } from 'pinia'
import '@/css/base.css'

// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initializeAuth } from './services/auth'

// Initialize auth token before app mounts
initializeAuth()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
