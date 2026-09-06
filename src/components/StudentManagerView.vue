<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, Trash2, Edit2, Search, FileSpreadsheet } from 'lucide-vue-next';
import type { Student } from '../types';

const props = defineProps<{
  students: Student[];
}>();

const emit = defineEmits<{
  (e: 'addStudent', student: { nim: string; name: string }): void;
  (e: 'updateStudent', id: string, data: Partial<Student>): void;
  (e: 'removeStudent', id: string): void;
  (e: 'openPaste'): void;
}>();

const searchQuery = ref('');
const showAddModal = ref(false);
const newNim = ref('');
const newName = ref('');

const editingId = ref<string | null>(null);
const editNim = ref('');
const editName = ref('');

const filteredStudents = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.students;
  return props.students.filter(
    (s) => s.name.toLowerCase().includes(q) || s.nim.toLowerCase().includes(q)
  );
});

function handleAddSingle() {
  if (!newNim.value.trim() || !newName.value.trim()) return;
  emit('addStudent', {
    nim: newNim.value.trim(),
    name: newName.value.trim()
  });
  newNim.value = '';
  newName.value = '';
  showAddModal.value = false;
}

function startEdit(student: Student) {
  editingId.value = student.id;
  editNim.value = student.nim;
  editName.value = student.name;
}

function saveEdit(id: string) {
  if (!editNim.value.trim() || !editName.value.trim()) return;
  emit('updateStudent', id, {
    nim: editNim.value.trim(),
    name: editName.value.trim()
  });
  editingId.value = null;
}
</script>

<template>
  <div class="space-y-4 pb-20">
    <!-- Header with Action Buttons -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-sm font-bold text-slate-800">Daftar Mahasiswa Kelas Utama</h2>
        <p class="text-xs text-slate-500">Total: {{ students.length }} Mahasiswa Terdaftar</p>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          @click="emit('openPaste')"
          class="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1 transition active:scale-95"
        >
          <FileSpreadsheet class="w-4 h-4" />
          <span>Paste Excel</span>
        </button>
        <button
          @click="showAddModal = true"
          class="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition active:scale-95"
        >
          <Plus class="w-4 h-4" />
          <span>Manual</span>
        </button>
      </div>
    </div>

    <!-- Search Input -->
    <div class="relative">
      <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        id="manage-students-search"
        v-model="searchQuery"
        type="text"
        aria-label="Cari berdasarkan NIM atau nama"
        placeholder="Cari berdasarkan NIM atau nama..."
        class="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
      />
    </div>

    <!-- Manual Add Form -->
    <div v-if="showAddModal" class="bg-white p-4 rounded-2xl border border-slate-300 shadow-sm space-y-3">
      <h3 class="text-xs font-bold text-slate-700">Tambah 1 Mahasiswa Manual</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label for="add-student-nim" class="block text-[10px] font-bold text-slate-600 mb-0.5">NIM *</label>
          <input
            id="add-student-nim"
            v-model="newNim"
            type="text"
            placeholder="NIM *"
            class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label for="add-student-name" class="block text-[10px] font-bold text-slate-600 mb-0.5">Nama Lengkap *</label>
          <input
            id="add-student-name"
            v-model="newName"
            type="text"
            placeholder="Nama Lengkap *"
            class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <button
          @click="showAddModal = false"
          class="text-xs px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          Batal
        </button>
        <button
          @click="handleAddSingle"
          :disabled="!newNim.trim() || !newName.trim()"
          class="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 px-4 py-1.5 rounded-xl transition"
        >
          Simpan
        </button>
      </div>
    </div>

    <!-- Student Cards List -->
    <div class="space-y-2">
      <div
        v-for="(student, idx) in filteredStudents"
        :key="student.id"
        class="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-2"
      >
        <!-- Inline Edit -->
        <div v-if="editingId === student.id" class="flex-1 flex items-center gap-2">
          <input
            :id="'edit-student-nim-' + student.id"
            v-model="editNim"
            type="text"
            aria-label="Edit NIM Mahasiswa"
            class="w-28 text-xs p-1.5 border border-slate-300 rounded font-mono"
            placeholder="NIM"
          />
          <input
            :id="'edit-student-name-' + student.id"
            v-model="editName"
            type="text"
            aria-label="Edit Nama Mahasiswa"
            class="flex-1 text-xs p-1.5 border border-slate-300 rounded"
            placeholder="Nama"
          />
          <button
            @click="saveEdit(student.id)"
            class="text-xs px-2 py-1 bg-emerald-600 text-white rounded font-bold"
          >
            OK
          </button>
        </div>

        <!-- Display Normal -->
        <div v-else class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-semibold text-slate-400">#{{ idx + 1 }}</span>
            <span class="font-mono text-xs font-semibold text-slate-500">{{ student.nim }}</span>
          </div>
          <div class="font-bold text-xs sm:text-sm text-slate-800 truncate mt-0.5">
            {{ student.name }}
          </div>
        </div>

        <div v-if="editingId !== student.id" class="flex items-center gap-1 shrink-0">
          <button
            @click="startEdit(student)"
            class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <Edit2 class="w-3.5 h-3.5" />
          </button>
          <button
            @click="emit('removeStudent', student.id)"
            class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredStudents.length === 0" class="bg-white rounded-2xl p-6 text-center border border-slate-200">
        <p class="text-xs text-slate-500">Tidak ada mahasiswa yang ditemukan.</p>
      </div>
    </div>
  </div>
</template>
