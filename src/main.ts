import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline PWA capability
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Update aplikasi tersedia.');
  },
  onOfflineReady() {
    console.log('Aplikasi m-hadir siap digunakan offline!');
  }
});

createApp(App).mount('#app');

