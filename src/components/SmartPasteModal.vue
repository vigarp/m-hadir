<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, Check, AlertCircle, FileSpreadsheet } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  targetType?: 'main' | 'guest';
  courseName?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'import', data: { students: Array<{ nim: string; name: string }>; replace: boolean }): void;
}>();

import { parseExcelStudentText, type ParsedStudent } from '../utils/parser';

const rawText = ref('');
const replaceExisting = ref(false);

// Parse text whenever rawText updates
const parsedStudents = computed<ParsedStudent[]>(() => {
  return parseExcelStudentText(rawText.value);
});

function handleImport() {
  if (parsedStudents.value.length === 0) return;
  emit('import', {
    students: parsedStudents.value,
    replace: replaceExisting.value
  });
  rawText.value = '';
  emit('close');
}

function loadSample() {
  rawText.value = `NIM\tNama Mahasiswa
2201001\tAhmad Fauzi
2201002\tAnnisa Putri
2201003\tBagas Pratama
2201004\tCitra Dewi
2201005\tDimas Anggara
2201006\tEka Lestari`;
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
    <div class="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <FileSpreadsheet class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-800">
              {{ targetType === 'guest' ? `Paste Mahasiswa Revisi (${courseName || 'Matkul'})` : 'Import Data Mahasiswa' }}
            </h2>
            <p class="text-xs text-slate-500">Copy 2 kolom (NIM & Nama) dari Excel lalu paste</p>
          </div>
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

      <!-- Modal Body -->
      <div class="p-5 overflow-y-auto space-y-4 flex-1 text-sm">
        <!-- Instruction Banner -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 flex gap-2.5 items-start">
          <AlertCircle class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p class="font-semibold">Cara Cepat dari Excel:</p>
            <ol class="list-decimal list-inside space-y-0.5 mt-1 text-blue-700">
              <li>Blok 2 kolom di Excel (Kolom <strong>NIM</strong> dan Kolom <strong>Nama</strong>).</li>
              <li>Tekan <strong>Ctrl + C</strong> di keyboard HP/laptop.</li>
              <li>Paste (Tempel) langsung di kotak bawah ini.</li>
            </ol>
            <button
              @click="loadSample"
              type="button"
              class="mt-2 text-xs font-semibold text-blue-600 underline hover:text-blue-800"
            >
              Coba gunakan teks contoh
            </button>
          </div>
        </div>

        <!-- Textarea -->
        <div>
          <label for="paste-excel-textarea" class="block text-xs font-bold text-slate-700 mb-1">
            Area Paste Excel:
          </label>
          <textarea
            id="paste-excel-textarea"
            v-model="rawText"
            rows="5"
            placeholder="Paste tabel Excel di sini (contoh: 2201001 [Tab] Budi Santoso)..."
            class="w-full font-mono text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 transition"
          ></textarea>
        </div>

        <!-- Option: Append or Replace (for main students) -->
        <div v-if="targetType !== 'guest'" class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <label for="toggle-replace-existing" class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              id="toggle-replace-existing"
              type="checkbox"
              v-model="replaceExisting"
              class="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span>Gantikan seluruh data mahasiswa yang ada (Reset)</span>
          </label>
          <p class="text-[11px] text-slate-500">
            Jika tidak dicentang, mahasiswa baru akan ditambahkan tanpa menduplikasi NIM yang sudah terdaftar.
          </p>
        </div>

        <!-- Live Preview -->
        <div v-if="parsedStudents.length > 0">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-bold text-slate-700">
              Preview Hasil Parse ({{ parsedStudents.length }} Mahasiswa):
            </span>
            <span class="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Siap diimport
            </span>
          </div>

          <div class="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-600 sticky top-0 border-b border-slate-200">
                <tr>
                  <th class="py-2 px-3 font-semibold w-10">No</th>
                  <th class="py-2 px-3 font-semibold w-28">NIM</th>
                  <th class="py-2 px-3 font-semibold">Nama Mahasiswa</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(item, idx) in parsedStudents" :key="idx" class="hover:bg-slate-50">
                  <td class="py-1.5 px-3 text-slate-500 text-center">{{ idx + 1 }}</td>
                  <td class="py-1.5 px-3 font-mono font-medium text-slate-700">{{ item.nim }}</td>
                  <td class="py-1.5 px-3 text-slate-800">{{ item.name }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
        <button
          @click="emit('close')"
          class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200 transition"
        >
          Batal
        </button>
        <button
          @click="handleImport"
          :disabled="parsedStudents.length === 0"
          :class="[
            'px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm flex items-center gap-1.5 transition active:scale-95',
            parsedStudents.length > 0
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          ]"
        >
          <Check class="w-4 h-4" />
          <span>Simpan {{ parsedStudents.length }} Mahasiswa</span>
        </button>
      </div>
    </div>
  </div>
</template>
