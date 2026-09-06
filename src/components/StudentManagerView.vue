<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, Trash2, Edit2, Search, FileSpreadsheet, Code2, Check, BookOpen } from 'lucide-vue-next';
import type { Student, Course } from '../types';

const props = defineProps<{
  students: Student[];
  courses?: Course[];
}>();

const emit = defineEmits<{
  (e: 'addStudent', student: { nim: string; name: string; courseIds?: string[] }): void;
  (e: 'updateStudent', id: string, data: Partial<Student>): void;
  (e: 'removeStudent', id: string): void;
  (e: 'openPaste'): void;
  (e: 'openJsonImport'): void;
}>();

const searchQuery = ref('');
const filterScope = ref<'all' | 'regular' | 'revisi'>('all');

const showAddModal = ref(false);
const newNim = ref('');
const newName = ref('');
const newCourseScope = ref<'all' | 'specific'>('all');
const newSelectedCourses = ref<string[]>([]);

const editingId = ref<string | null>(null);
const editNim = ref('');
const editName = ref('');
const editCourseScope = ref<'all' | 'specific'>('all');
const editSelectedCourses = ref<string[]>([]);

const filteredStudents = computed(() => {
  let list = props.students;

  if (filterScope.value === 'regular') {
    list = list.filter((s) => !s.courseIds || s.courseIds.length === 0);
  } else if (filterScope.value === 'revisi') {
    list = list.filter((s) => s.courseIds && s.courseIds.length > 0);
  }

  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (s) => s.name.toLowerCase().includes(q) || s.nim.toLowerCase().includes(q)
  );
});

function handleAddSingle() {
  if (!newNim.value.trim() || !newName.value.trim()) return;
  emit('addStudent', {
    nim: newNim.value.trim(),
    name: newName.value.trim(),
    courseIds: newCourseScope.value === 'specific' && newSelectedCourses.value.length > 0
      ? [...newSelectedCourses.value]
      : undefined
  });
  newNim.value = '';
  newName.value = '';
  newCourseScope.value = 'all';
  newSelectedCourses.value = [];
  showAddModal.value = false;
}

function startEdit(student: Student) {
  editingId.value = student.id;
  editNim.value = student.nim;
  editName.value = student.name;
  editCourseScope.value = (student.courseIds && student.courseIds.length > 0) ? 'specific' : 'all';
  editSelectedCourses.value = student.courseIds ? [...student.courseIds] : [];
}

function saveEdit(id: string) {
  if (!editNim.value.trim() || !editName.value.trim()) return;
  emit('updateStudent', id, {
    nim: editNim.value.trim(),
    name: editName.value.trim(),
    courseIds: editCourseScope.value === 'specific' && editSelectedCourses.value.length > 0
      ? [...editSelectedCourses.value]
      : undefined
  });
  editingId.value = null;
}

function toggleCourseSelection(courseId: string, target: 'new' | 'edit') {
  const list = target === 'new' ? newSelectedCourses.value : editSelectedCourses.value;
  const idx = list.indexOf(courseId);
  if (idx > -1) {
    list.splice(idx, 1);
  } else {
    list.push(courseId);
  }
}

function getCourseName(courseId: string): string {
  const c = props.courses?.find((x) => x.id === courseId);
  return c ? (c.className ? `${c.name} [${c.className}]` : c.name) : 'Matkul';
}
</script>

<template>
  <div class="space-y-4 pb-20">
    <!-- Header with Action Buttons -->
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <div>
        <h2 class="text-sm font-bold text-slate-800">Daftar Mahasiswa</h2>
        <p class="text-xs text-slate-500">Total: {{ students.length }} Mahasiswa Terdaftar</p>
      </div>

      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          @click="emit('openJsonImport')"
          class="text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition active:scale-95 shadow-2xs"
          title="Input Massal via JSON"
          aria-label="Input Massal via JSON"
        >
          <Code2 class="w-3.5 h-3.5 text-indigo-600" />
          <span>{ } JSON</span>
        </button>
        <button
          type="button"
          @click="emit('openPaste')"
          class="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition active:scale-95"
        >
          <FileSpreadsheet class="w-3.5 h-3.5" />
          <span>Paste Excel</span>
        </button>
        <button
          type="button"
          @click="showAddModal = true"
          class="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition active:scale-95"
        >
          <Plus class="w-4 h-4" />
          <span>Manual</span>
        </button>
      </div>
    </div>

    <!-- Search & Filter Scope Row -->
    <div class="space-y-2">
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

      <!-- Filter chips: Semua vs Reguler vs Revisi -->
      <div class="flex items-center gap-1 text-[11px]">
        <button
          type="button"
          @click="filterScope = 'all'"
          :class="[
            'px-2.5 py-1 rounded-full font-medium transition',
            filterScope === 'all'
              ? 'bg-slate-800 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          ]"
        >
          Semua ({{ students.length }})
        </button>
        <button
          type="button"
          @click="filterScope = 'regular'"
          :class="[
            'px-2.5 py-1 rounded-full font-medium transition',
            filterScope === 'regular'
              ? 'bg-slate-800 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          ]"
        >
          Reguler (Semua Matkul)
        </button>
        <button
          type="button"
          @click="filterScope = 'revisi'"
          :class="[
            'px-2.5 py-1 rounded-full font-medium transition',
            filterScope === 'revisi'
              ? 'bg-purple-700 text-white'
              : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
          ]"
        >
          Mahasiswa Revisi
        </button>
      </div>
    </div>

    <!-- Manual Add Form Modal/Expander -->
    <div v-if="showAddModal" class="bg-white p-4 rounded-2xl border border-slate-300 shadow-sm space-y-3 animate-in fade-in duration-150">
      <h3 class="text-xs font-bold text-slate-700">Tambah Mahasiswa Baru</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label for="add-student-nim" class="block text-[10px] font-bold text-slate-600 mb-0.5">NIM *</label>
          <input
            id="add-student-nim"
            v-model="newNim"
            type="text"
            placeholder="Contoh: 2201001"
            class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500"
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

      <!-- Lingkup Mata Kuliah (Reguler vs Revisi) -->
      <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
        <span class="block text-[11px] font-bold text-slate-700">Lingkup Mata Kuliah:</span>
        <div class="flex items-center gap-4 text-xs">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              value="all"
              v-model="newCourseScope"
              class="text-emerald-600 focus:ring-emerald-500"
            />
            <span class="font-medium text-slate-700">Semua Matkul (Reguler)</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              value="specific"
              v-model="newCourseScope"
              class="text-purple-600 focus:ring-purple-500"
            />
            <span class="font-bold text-purple-700">Hanya Matkul Tertentu (Revisi)</span>
          </label>
        </div>

        <!-- Matkul Checkboxes if Specific -->
        <div v-if="newCourseScope === 'specific'" class="pt-2 border-t border-slate-200/80 space-y-1.5">
          <span class="text-[10px] font-bold text-slate-500 block">Pilih Mata Kuliah untuk Mahasiswa Ini:</span>
          <div v-if="courses && courses.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <label
              v-for="c in courses"
              :key="c.id"
              class="flex items-center gap-2 p-1.5 rounded-lg border bg-white cursor-pointer text-xs"
              :class="newSelectedCourses.includes(c.id) ? 'border-purple-400 bg-purple-50/50' : 'border-slate-200'"
            >
              <input
                type="checkbox"
                :checked="newSelectedCourses.includes(c.id)"
                @change="toggleCourseSelection(c.id, 'new')"
                class="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
              />
              <span class="truncate font-medium text-slate-800">{{ c.name }}</span>
            </label>
          </div>
          <p v-else class="text-[10px] text-amber-700 italic">Belum ada mata kuliah yang terdaftar.</p>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-1">
        <button
          type="button"
          @click="showAddModal = false"
          class="text-xs px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          Batal
        </button>
        <button
          type="button"
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
        class="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col gap-2"
      >
        <!-- Inline Edit Mode -->
        <div v-if="editingId === student.id" class="space-y-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label :for="'edit-nim-' + student.id" class="text-[10px] font-bold text-slate-500 block mb-0.5">NIM</label>
              <input
                :id="'edit-nim-' + student.id"
                v-model="editNim"
                type="text"
                class="w-full text-xs p-2 border border-slate-300 rounded-lg font-mono bg-white"
                placeholder="NIM"
              />
            </div>
            <div>
              <label :for="'edit-name-' + student.id" class="text-[10px] font-bold text-slate-500 block mb-0.5">Nama</label>
              <input
                :id="'edit-name-' + student.id"
                v-model="editName"
                type="text"
                class="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                placeholder="Nama Lengkap"
              />
            </div>
          </div>

          <!-- Edit Course Scope -->
          <div class="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1.5">
            <span class="block text-[10px] font-bold text-slate-700">Lingkup Mata Kuliah:</span>
            <div class="flex items-center gap-3 text-xs">
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  value="all"
                  v-model="editCourseScope"
                  class="text-emerald-600 focus:ring-emerald-500"
                />
                <span class="font-medium text-slate-700 text-[11px]">Semua Matkul</span>
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  value="specific"
                  v-model="editCourseScope"
                  class="text-purple-600 focus:ring-purple-500"
                />
                <span class="font-bold text-purple-700 text-[11px]">Hanya Matkul Tertentu (Revisi)</span>
              </label>
            </div>

            <div v-if="editCourseScope === 'specific'" class="pt-1.5 border-t border-slate-100 space-y-1">
              <div v-if="courses && courses.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                <label
                  v-for="c in courses"
                  :key="c.id"
                  class="flex items-center gap-1.5 p-1 rounded border cursor-pointer"
                  :class="editSelectedCourses.includes(c.id) ? 'border-purple-300 bg-purple-50/50' : 'border-slate-100'"
                >
                  <input
                    type="checkbox"
                    :checked="editSelectedCourses.includes(c.id)"
                    @change="toggleCourseSelection(c.id, 'edit')"
                    class="rounded text-purple-600 w-3 h-3"
                  />
                  <span class="truncate text-slate-800">{{ c.name }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              @click="editingId = null"
              class="text-xs px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              Batal
            </button>
            <button
              type="button"
              @click="saveEdit(student.id)"
              class="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1"
            >
              <Check class="w-3.5 h-3.5" />
              <span>Simpan</span>
            </button>
          </div>
        </div>

        <!-- Normal View Mode -->
        <div v-else class="flex items-center justify-between gap-2">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[11px] font-semibold text-slate-500">#{{ idx + 1 }}</span>
              <span class="font-mono text-xs font-semibold text-slate-600">{{ student.nim }}</span>
              <span
                v-if="!student.courseIds || student.courseIds.length === 0"
                class="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded"
              >
                Semua Matkul
              </span>
            </div>
            <div class="font-bold text-xs sm:text-sm text-slate-800 truncate mt-0.5">
              {{ student.name }}
            </div>

            <!-- Revisi Badges per Course if scoped -->
            <div v-if="student.courseIds && student.courseIds.length > 0" class="flex items-center gap-1 flex-wrap mt-1">
              <span
                v-for="cid in student.courseIds"
                :key="cid"
                class="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded-md flex items-center gap-1"
              >
                <BookOpen class="w-2.5 h-2.5 text-purple-500" />
                <span>Revisi: {{ getCourseName(cid) }}</span>
              </span>
            </div>
          </div>

          <div class="flex items-center gap-1 shrink-0">
            <button
              type="button"
              @click="startEdit(student)"
              class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              :aria-label="`Edit mahasiswa ${student.name}`"
            >
              <Edit2 class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              @click="emit('removeStudent', student.id)"
              class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
              :aria-label="`Hapus mahasiswa ${student.name}`"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredStudents.length === 0" class="bg-white rounded-2xl p-6 text-center border border-slate-200">
        <p class="text-xs text-slate-500">Tidak ada mahasiswa yang ditemukan.</p>
      </div>
    </div>
  </div>
</template>
