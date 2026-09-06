<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, Copy, Check, MessageSquare, Share2 } from 'lucide-vue-next';
import type { Course, Student, AttendanceStatus } from '../types';

const props = defineProps<{
  isOpen: boolean;
  course?: Course;
  date: string;
  meetingNo?: number;
  students: Student[];
  records: Record<string, AttendanceStatus>;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// Filter options for generator
import { formatWhatsAppReport } from '../utils/whatsappFormatter';

type FilterMode = 'absent_only' | 'present_only' | 'all';
const filterMode = ref<FilterMode>('absent_only');
const includeNIM = ref<boolean>(true);
const includeGuestBadge = ref<boolean>(true);
const includeSummary = ref<boolean>(true);
const customHeaderNote = ref<string>('');
const isCopied = ref<boolean>(false);

// Generate the WhatsApp text string using pure utility
const generatedText = computed(() => {
  return formatWhatsAppReport({
    course: props.course,
    date: props.date,
    meetingNo: props.meetingNo,
    students: props.students,
    records: props.records,
    filterMode: filterMode.value,
    includeNIM: includeNIM.value,
    includeGuestBadge: includeGuestBadge.value,
    includeSummary: includeSummary.value,
    customHeaderNote: customHeaderNote.value
  });
});

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(generatedText.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy text:', err);
  }
}

function shareOrOpenWhatsApp() {
  // Try native share API first (excellent for mobile WhatsApp picker)
  if (navigator.share) {
    navigator.share({
      title: `Presensi ${props.course?.name || 'Kelas'}`,
      text: generatedText.value
    }).catch(() => {
      // Fallback if canceled or error
      openWhatsAppDirect();
    });
  } else {
    openWhatsAppDirect();
  }
}

function openWhatsAppDirect() {
  const encoded = encodeURIComponent(generatedText.value);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
    <div class="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
      <!-- Modal Header -->
      <div class="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-emerald-700 text-white">
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-emerald-800 rounded-lg">
            <MessageSquare class="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h2 class="text-base font-bold leading-tight">Generate Format WhatsApp</h2>
            <p class="text-xs text-emerald-200">Siap kirim ke Dosen atau Grup Kelas</p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-sm bg-slate-50">
        <!-- Target Criteria Selection -->
        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <span class="block text-xs font-bold text-slate-700">
            Kriteria yang Ingin Di-generate:
          </span>
          <div class="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              @click="filterMode = 'absent_only'"
              :class="[
                'py-2 px-1.5 rounded-lg transition text-center',
                filterMode === 'absent_only'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              Hanya Ga Masuk
            </button>
            <button
              @click="filterMode = 'present_only'"
              :class="[
                'py-2 px-1.5 rounded-lg transition text-center',
                filterMode === 'present_only'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              Hanya Masuk
            </button>
            <button
              @click="filterMode = 'all'"
              :class="[
                'py-2 px-1.5 rounded-lg transition text-center',
                filterMode === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              Rekap Lengkap
            </button>
          </div>
        </div>

        <!-- Customization Toggles -->
        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
          <span class="block text-xs font-bold text-slate-700">
            Pilihan Tampilan:
          </span>
          <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-700">
            <label for="toggle-include-nim" class="flex items-center gap-1.5 cursor-pointer">
              <input
                id="toggle-include-nim"
                type="checkbox"
                v-model="includeNIM"
                class="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Sertakan NIM</span>
            </label>
            <label for="toggle-guest-badge" class="flex items-center gap-1.5 cursor-pointer">
              <input
                id="toggle-guest-badge"
                type="checkbox"
                v-model="includeGuestBadge"
                class="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Tandai Mahasiswa Revisi</span>
            </label>
            <label for="toggle-include-summary" class="flex items-center gap-1.5 cursor-pointer">
              <input
                id="toggle-include-summary"
                type="checkbox"
                v-model="includeSummary"
                class="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Ringkasan Angka</span>
            </label>
          </div>

          <div>
            <input
              id="custom-header-note"
              v-model="customHeaderNote"
              type="text"
              aria-label="Catatan tambahan (opsional)"
              placeholder="Catatan tambahan (opsional, misal: Dosen berhalangan)..."
              class="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <!-- Live Preview Textarea -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="whatsapp-preview-textarea" class="text-xs font-bold text-slate-700">
              Preview Pesan WhatsApp:
            </label>
            <span class="text-[11px] text-slate-500 font-mono">
              {{ generatedText.length }} karakter
            </span>
          </div>
          <div class="relative">
            <textarea
              id="whatsapp-preview-textarea"
              :value="generatedText"
              readonly
              rows="9"
              class="w-full text-xs font-mono p-3 bg-white border border-slate-300 rounded-xl leading-relaxed text-slate-800 shadow-inner resize-none focus:outline-none"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-4 py-3 border-t border-slate-200 bg-white flex items-center gap-2 pb-safe">
        <button
          @click="copyToClipboard"
          :class="[
            'flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border',
            isCopied
              ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
              : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
          ]"
        >
          <Check v-if="isCopied" class="w-4 h-4 text-emerald-600" />
          <Copy v-else class="w-4 h-4" />
          <span>{{ isCopied ? 'Tersalin!' : 'Salin Teks' }}</span>
        </button>

        <button
          @click="shareOrOpenWhatsApp"
          class="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          <Share2 class="w-4 h-4" />
          <span>Kirim ke WhatsApp</span>
        </button>
      </div>
    </div>
  </div>
</template>

