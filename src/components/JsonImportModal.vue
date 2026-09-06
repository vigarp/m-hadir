<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, Code2, Check, AlertCircle, Sparkles, BookOpen, Users } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'import', data: { jsonString: string; replaceCourses: boolean; replaceStudents: boolean }): void;
}>();

const rawJson = ref('');
const replaceCourses = ref(false);
const replaceStudents = ref(false);

const SAMPLE_JSON = `{
  "courses": [
    {
      "name": "ANALISA PROSES BISNIS",
      "code": "22SIF0112",
      "className": "03SIFE003",
      "lecturer": "FINGKI MARWATI S.Kom., M.Kom.",
      "time": "07.40 - 09.40"
    },
    {
      "name": "BASIS DATA LANJUT",
      "code": "22SIF0113",
      "className": "03SIFE003",
      "lecturer": "Ibu Ratna, M.T.",
      "time": "10.00 - 12.00"
    }
  ],
  "students": [
    { "nim": "2201001", "name": "Ahmad Fauzi" },
    { "nim": "2201002", "name": "Annisa Putri" },
    {
      "nim": "2101099",
      "name": "Rian Permana (Revisi)",
      "courseNames": ["ANALISA PROSES BISNIS"]
    }
  ]
}`;

function loadSampleTemplate() {
  rawJson.value = SAMPLE_JSON;
}

const parseState = computed(() => {
  const text = rawJson.value.trim();
  if (!text) {
    return { valid: false, error: '', coursesCount: 0, studentsCount: 0, items: [] as string[] };
  }

  try {
    const parsed = JSON.parse(text);
    let coursesCount = 0;
    let studentsCount = 0;
    const previews: string[] = [];

    if (Array.isArray(parsed)) {
      if (parsed.length > 0) {
        const first = parsed[0];
        if (first && (first.nim !== undefined || (!first.lecturer && !first.time && !first.code && !first.className))) {
          studentsCount = parsed.length;
          parsed.slice(0, 3).forEach((s: any) => previews.push(`Mahasiswa: ${s.nim || ''} - ${s.name || 'Tanpa Nama'}`));
        } else {
          coursesCount = parsed.length;
          parsed.slice(0, 3).forEach((c: any) => previews.push(`Matkul: ${c.name || 'Tanpa Nama'}`));
        }
      }
    } else if (typeof parsed === 'object' && parsed !== null) {
      if (Array.isArray(parsed.courses)) {
        coursesCount = parsed.courses.length;
        parsed.courses.slice(0, 2).forEach((c: any) => previews.push(`Matkul: ${c.name || 'Tanpa Nama'}`));
      }
      const stList = Array.isArray(parsed.students) ? parsed.students : Array.isArray(parsed.mainStudents) ? parsed.mainStudents : null;
      if (stList) {
        studentsCount = stList.length;
        stList.slice(0, 2).forEach((s: any) => previews.push(`Mahasiswa: ${s.nim || ''} - ${s.name || 'Tanpa Nama'}`));
      }
    }

    return {
      valid: coursesCount > 0 || studentsCount > 0,
      error: coursesCount === 0 && studentsCount === 0 ? 'Format JSON valid, namun tidak ditemukan data mata kuliah atau mahasiswa.' : '',
      coursesCount,
      studentsCount,
      items: previews
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Format JSON tidak valid: ${err.message}`,
      coursesCount: 0,
      studentsCount: 0,
      items: [] as string[]
    };
  }
});

function handleImport() {
  if (!parseState.value.valid) return;
  emit('import', {
    jsonString: rawJson.value.trim(),
    replaceCourses: replaceCourses.value,
    replaceStudents: replaceStudents.value
  });
  rawJson.value = '';
  emit('close');
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
    <div class="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in slide-in-from-bottom duration-200">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div class="flex items-center gap-2.5">
          <div class="p-2 bg-slate-900 text-emerald-400 rounded-xl">
            <Code2 class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-800">Input Data Massal via JSON</h2>
            <p class="text-xs text-slate-500">Seed cepat mata kuliah dan mahasiswa sekaligus</p>
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

      <!-- Body -->
      <div class="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
        <!-- Quick Action: Template button -->
        <div class="flex items-center justify-between">
          <label for="json-seed-input" class="font-bold text-slate-700">
            Paste Data JSON:
          </label>
          <button
            type="button"
            @click="loadSampleTemplate"
            class="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
          >
            <Sparkles class="w-3 h-3 text-emerald-600" />
            <span>Gunakan Contoh Format</span>
          </button>
        </div>

        <!-- Textarea -->
        <div class="relative">
          <textarea
            id="json-seed-input"
            v-model="rawJson"
            rows="8"
            placeholder='{ "courses": [...], "students": [...] } atau [ { "name": "Matkul A" }, ... ]'
            class="w-full font-mono text-[11px] p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 transition"
          ></textarea>
        </div>

        <!-- Error Feedback -->
        <div v-if="parseState.error" class="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
          <span class="text-[11px] font-medium leading-tight">{{ parseState.error }}</span>
        </div>

        <!-- Success Preview Banner -->
        <div v-if="parseState.valid" class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
          <div class="flex items-center gap-3 font-bold text-emerald-800 text-xs">
            <span v-if="parseState.coursesCount > 0" class="flex items-center gap-1">
              <BookOpen class="w-3.5 h-3.5 text-emerald-600" />
              <span>{{ parseState.coursesCount }} Mata Kuliah</span>
            </span>
            <span v-if="parseState.studentsCount > 0" class="flex items-center gap-1">
              <Users class="w-3.5 h-3.5 text-emerald-600" />
              <span>{{ parseState.studentsCount }} Mahasiswa</span>
            </span>
          </div>

          <!-- Preview Items -->
          <div v-if="parseState.items.length > 0" class="text-[10px] text-slate-600 space-y-0.5 border-t border-emerald-200/60 pt-1.5">
            <div v-for="(item, idx) in parseState.items" :key="idx" class="truncate font-mono">
              • {{ item }}
            </div>
            <div v-if="parseState.coursesCount + parseState.studentsCount > parseState.items.length" class="text-slate-400 italic">
              ... dan {{ (parseState.coursesCount + parseState.studentsCount) - parseState.items.length }} data lainnya siap diimport
            </div>
          </div>
        </div>

        <!-- Options: Append or Replace -->
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <span class="block font-bold text-slate-700 text-[11px]">Opsi Import:</span>
          <div class="space-y-1.5">
            <label for="toggle-replace-courses" class="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
              <input
                id="toggle-replace-courses"
                type="checkbox"
                v-model="replaceCourses"
                class="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Gantikan seluruh data mata kuliah yang ada (Reset Matkul)</span>
            </label>

            <label for="toggle-replace-students" class="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
              <input
                id="toggle-replace-students"
                type="checkbox"
                v-model="replaceStudents"
                class="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Gantikan seluruh data mahasiswa yang ada (Reset Mahasiswa)</span>
            </label>
          </div>
          <p class="text-[10px] text-slate-500">
            Jika tidak dicentang, data baru akan ditambahkan (append) ke data yang sudah ada tanpa menduplikasi nama/NIM yang sama.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 pb-safe">
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200 transition"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleImport"
          :disabled="!parseState.valid"
          :class="[
            'px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm flex items-center gap-1.5 transition active:scale-95',
            parseState.valid
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          ]"
        >
          <Check class="w-4 h-4" />
          <span>Simpan ke Aplikasi</span>
        </button>
      </div>
    </div>
  </div>
</template>
