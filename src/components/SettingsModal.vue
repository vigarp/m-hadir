<script setup lang="ts">
import { ref } from 'vue';
import { X, Download, Upload, Smartphone, Check, Code2, ArrowRight } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  canInstallPwa: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'exportBackup'): void;
  (e: 'importBackup', content: string): void;
  (e: 'installPwa'): void;
  (e: 'openJsonImport'): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const importStatus = ref<string | null>(null);

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    if (text) {
      emit('importBackup', text);
      importStatus.value = 'Data berhasil dipulihkan!';
      setTimeout(() => {
        importStatus.value = null;
        emit('close');
      }, 1200);
    }
  };
  reader.readAsText(file);
}

function triggerFileInput() {
  fileInput.value?.click();
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
    <div class="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
      <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h2 class="text-sm font-bold text-slate-800">Pengaturan & Cadangan</h2>
          <p class="text-xs text-slate-500">Kelola data offline dan instalasi aplikasi</p>
        </div>
        <button
          type="button"
          @click="emit('close')"
          aria-label="Tutup modal"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-5 space-y-4 text-xs">
        <!-- Install PWA Banner -->
        <div v-if="canInstallPwa" class="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-2">
          <div class="flex items-center gap-2 text-emerald-800 font-bold">
            <Smartphone class="w-4 h-4 text-emerald-600" />
            <span>Install m-hadir di HP</span>
          </div>
          <p class="text-emerald-700 text-[11px]">
            Install aplikasi ini di layar utama HP Anda agar bisa dibuka langsung seperti aplikasi biasa tanpa kuota internet.
          </p>
          <button
            type="button"
            @click="emit('installPwa')"
            class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition"
          >
            Tambahkan ke Layar Utama
          </button>
        </div>

        <!-- Backup & Restore -->
        <div class="space-y-2.5">
          <h3 class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Cadangkan Data (Anti-Hilang)</h3>
          <p class="text-slate-600 text-[11px]">
            Karena aplikasi ini tidak memakai server (100% offline), Anda dapat mengunduh file cadangan data ke HP Anda.
          </p>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              @click="emit('exportBackup')"
              class="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center gap-1.5 text-center transition active:scale-95"
            >
              <Download class="w-5 h-5 text-emerald-600" />
              <span class="font-bold text-slate-800">Download Backup</span>
              <span class="text-[10px] text-slate-500">Simpan file .json</span>
            </button>

            <button
              type="button"
              @click="triggerFileInput"
              class="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center gap-1.5 text-center transition active:scale-95"
            >
              <Upload class="w-5 h-5 text-blue-600" />
              <span class="font-bold text-slate-800">Pulihkan Data</span>
              <span class="text-[10px] text-slate-500">Unggah file .json</span>
            </button>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept=".json"
            aria-label="Pilih file backup JSON"
            class="hidden"
            @change="handleFileChange"
          />

          <div v-if="importStatus" class="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-center font-bold flex items-center justify-center gap-1.5">
            <Check class="w-4 h-4" />
            <span>{{ importStatus }}</span>
          </div>
        </div>

        <!-- Input Massal JSON Section -->
        <div class="space-y-2.5 pt-2 border-t border-slate-100">
          <h3 class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Input Data Massal (JSON)</h3>
          <p class="text-slate-600 text-[11px]">
            Input daftar mata kuliah dan mahasiswa sekaligus banyak menggunakan teks JSON.
          </p>
          <button
            type="button"
            @click="emit('openJsonImport'); emit('close')"
            class="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between transition active:scale-98"
          >
            <div class="flex items-center gap-2">
              <div class="p-1.5 bg-slate-900 text-emerald-400 rounded-lg">
                <Code2 class="w-4 h-4" />
              </div>
              <div class="text-left">
                <span class="font-bold text-slate-800 block text-xs">Buka Editor JSON Massal</span>
                <span class="text-[10px] text-slate-500">Seed data matkul & mahasiswa instan</span>
              </div>
            </div>
            <ArrowRight class="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <!-- App Info -->
        <div class="pt-3 border-t border-slate-200 text-slate-500 text-[11px] space-y-1">
          <div class="flex justify-between">
            <span>Versi Aplikasi:</span>
            <span class="font-mono text-slate-600">v1.0.0 (PWA Offline)</span>
          </div>
          <div class="flex justify-between">
            <span>Penyimpanan:</span>
            <span class="text-slate-600">LocalStorage Perangkat</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
