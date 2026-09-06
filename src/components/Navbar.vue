<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Wifi, WifiOff, Users, BookOpen, Clock, Settings, FileSpreadsheet } from 'lucide-vue-next';

defineProps<{
  activeTab: 'attendance' | 'students' | 'courses' | 'history';
}>();

const emit = defineEmits<{
  (e: 'navigate', tab: 'attendance' | 'students' | 'courses' | 'history'): void;
  (e: 'openPaste'): void;
  (e: 'openSettings'): void;
}>();

const isOnline = ref(navigator.onLine);

function updateOnlineStatus() {
  isOnline.value = navigator.onLine;
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<template>
  <header class="sticky top-0 z-30 bg-slate-900 text-white shadow-md pt-safe">
    <div class="px-4 py-3 flex items-center justify-between">
      <!-- Brand & Offline Indicator -->
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-slate-900 shadow-sm text-sm tracking-tighter">
          mH
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <h1 class="font-bold text-base leading-tight tracking-tight">m-hadir</h1>
            <span
              :class="[
                'text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1',
                isOnline ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-amber-950/80 text-amber-400 border border-amber-800'
              ]"
            >
              <Wifi v-if="isOnline" class="w-2.5 h-2.5" />
              <WifiOff v-else class="w-2.5 h-2.5" />
              {{ isOnline ? 'Online' : 'Offline Mode' }}
            </span>
          </div>
          <p class="text-[11px] text-slate-400">Presensi Cepat Kelas & Mahasiswa KM</p>
        </div>
      </div>

      <!-- Quick Action Buttons on Top -->
      <div class="flex items-center gap-1">
        <button
          @click="emit('openPaste')"
          class="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
          title="Paste Excel Mahasiswa"
        >
          <FileSpreadsheet class="w-5 h-5 text-emerald-400" />
        </button>
        <button
          @click="emit('openSettings')"
          class="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
          title="Pengaturan & Backup"
        >
          <Settings class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Bottom Navigation Bar inside Header / Mobile Tabs -->
    <nav class="flex border-t border-slate-800 text-xs px-2">
      <button
        @click="emit('navigate', 'attendance')"
        :class="[
          'flex-1 py-2.5 text-center font-medium border-b-2 flex items-center justify-center gap-1.5 transition',
          activeTab === 'attendance'
            ? 'border-emerald-500 text-emerald-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        ]"
      >
        <span>Presensi</span>
      </button>

      <button
        @click="emit('navigate', 'courses')"
        :class="[
          'flex-1 py-2.5 text-center font-medium border-b-2 flex items-center justify-center gap-1.5 transition',
          activeTab === 'courses'
            ? 'border-emerald-500 text-emerald-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        ]"
      >
        <BookOpen class="w-3.5 h-3.5" />
        <span>Matkul</span>
      </button>

      <button
        @click="emit('navigate', 'students')"
        :class="[
          'flex-1 py-2.5 text-center font-medium border-b-2 flex items-center justify-center gap-1.5 transition',
          activeTab === 'students'
            ? 'border-emerald-500 text-emerald-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        ]"
      >
        <Users class="w-3.5 h-3.5" />
        <span>Mahasiswa</span>
      </button>

      <button
        @click="emit('navigate', 'history')"
        :class="[
          'flex-1 py-2.5 text-center font-medium border-b-2 flex items-center justify-center gap-1.5 transition',
          activeTab === 'history'
            ? 'border-emerald-500 text-emerald-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        ]"
      >
        <Clock class="w-3.5 h-3.5" />
        <span>Riwayat</span>
      </button>
    </nav>
  </header>
</template>

