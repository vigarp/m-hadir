<script setup lang="ts">
import { ref } from 'vue';
import { X, UserPlus, FileSpreadsheet } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  courseName?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'addSingle', student: { nim: string; name: string }): void;
  (e: 'openSmartPaste'): void;
}>();

const nim = ref('');
const name = ref('');

function handleSubmit() {
  if (!nim.value.trim() || !name.value.trim()) return;
  emit('addSingle', {
    nim: nim.value.trim(),
    name: name.value.trim()
  });
  nim.value = '';
  name.value = '';
  emit('close');
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
    <div class="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
      <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-purple-100 text-purple-700 rounded-lg">
            <UserPlus class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-800">Tambah Mahasiswa Revisi</h2>
            <p class="text-xs text-slate-500">Khusus matkul: {{ courseName || 'Aktif' }}</p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-5 space-y-3.5 text-xs">
        <div>
          <label for="add-guest-nim" class="block font-bold text-slate-700 mb-1">NIM Mahasiswa</label>
          <input
            id="add-guest-nim"
            v-model="nim"
            type="text"
            placeholder="Contoh: 2101099"
            required
            class="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div>
          <label for="add-guest-name" class="block font-bold text-slate-700 mb-1">Nama Mahasiswa</label>
          <input
            id="add-guest-name"
            v-model="name"
            type="text"
            placeholder="Contoh: Rian Permana (Revisi)"
            required
            class="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            @click="emit('openSmartPaste')"
            class="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <FileSpreadsheet class="w-3.5 h-3.5" />
            <span>Paste Banyak dari Excel</span>
          </button>

          <button
            type="submit"
            class="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
          >
            Simpan Mahasiswa
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
