<script setup lang="ts">
import { ref } from 'vue';
import { Plus, Trash2, Edit2, X, Users } from 'lucide-vue-next';
import type { Course } from '../types';

defineProps<{
  courses: Course[];
  activeCourseId: string;
}>();

const emit = defineEmits<{
  (e: 'selectCourse', id: string): void;
  (e: 'addCourse', course: { name: string; lecturer?: string; code?: string; className?: string; time?: string }): void;
  (e: 'updateCourse', id: string, course: Partial<Course>): void;
  (e: 'removeCourse', id: string): void;
  (e: 'removeCustomStudent', courseId: string, studentId: string): void;
  (e: 'openAddGuest', courseId: string): void;
}>();

const showAddForm = ref(false);
const newName = ref('');
const newLecturer = ref('');
const newCode = ref('');
const newClassName = ref('');
const newTime = ref('');

const editingId = ref<string | null>(null);
const editName = ref('');
const editLecturer = ref('');
const editCode = ref('');
const editClassName = ref('');
const editTime = ref('');

function handleAddCourse() {
  if (!newName.value.trim()) return;
  emit('addCourse', {
    name: newName.value.trim(),
    lecturer: newLecturer.value.trim(),
    code: newCode.value.trim(),
    className: newClassName.value.trim(),
    time: newTime.value.trim()
  });
  newName.value = '';
  newLecturer.value = '';
  newCode.value = '';
  newClassName.value = '';
  newTime.value = '';
  showAddForm.value = false;
}

function startEdit(course: Course) {
  editingId.value = course.id;
  editName.value = course.name;
  editLecturer.value = course.lecturer || '';
  editCode.value = course.code || '';
  editClassName.value = course.className || '';
  editTime.value = course.time || '';
}

function saveEdit(id: string) {
  if (!editName.value.trim()) return;
  emit('updateCourse', id, {
    name: editName.value.trim(),
    lecturer: editLecturer.value.trim(),
    code: editCode.value.trim(),
    className: editClassName.value.trim(),
    time: editTime.value.trim()
  });
  editingId.value = null;
}
</script>

<template>
  <div class="space-y-4 pb-20">
    <!-- Header with Add Button -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-sm font-bold text-slate-800">Daftar Mata Kuliah</h2>
        <p class="text-xs text-slate-500">Pilih mata kuliah aktif atau kelola matkul kelas</p>
      </div>
      <button
        @click="showAddForm = !showAddForm"
        class="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95"
      >
        <Plus class="w-4 h-4" />
        <span>Tambah Matkul</span>
      </button>
    </div>

    <!-- Form Tambah Matkul Baru -->
    <div v-if="showAddForm" class="bg-white p-4 rounded-2xl border border-emerald-300 shadow-sm space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-slate-700">Mata Kuliah Baru</h3>
        <button type="button" @click="showAddForm = false" aria-label="Batal tambah matkul" class="text-slate-400 hover:text-slate-600">
          <X class="w-4 h-4" />
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label for="add-course-name" class="block text-[11px] font-bold text-slate-700 mb-1">Nama Mata Kuliah *</label>
          <input
            id="add-course-name"
            v-model="newName"
            type="text"
            placeholder="Contoh: ANALISA PROSES BISNIS"
            class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label for="add-course-class" class="block text-[11px] font-bold text-slate-700 mb-1">Kelas</label>
          <input
            id="add-course-class"
            v-model="newClassName"
            type="text"
            placeholder="Contoh: 03SIFE003"
            class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label for="add-course-time" class="block text-[11px] font-bold text-slate-700 mb-1">Jam Kuliah (opsional)</label>
          <input
            id="add-course-time"
            v-model="newTime"
            type="text"
            placeholder="Contoh: 07.40 - 09.40"
            class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label for="add-course-lecturer" class="block text-[11px] font-bold text-slate-700 mb-1">Nama Dosen Pengampu</label>
          <input
            id="add-course-lecturer"
            v-model="newLecturer"
            type="text"
            placeholder="Contoh: FINGKI MARWATI S.Kom., M.Kom."
            class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div class="sm:col-span-2">
          <label for="add-course-code" class="block text-[11px] font-bold text-slate-700 mb-1">Kode Matkul (opsional)</label>
          <input
            id="add-course-code"
            v-model="newCode"
            type="text"
            placeholder="Contoh: 22SIF0112"
            class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>
      <div class="flex justify-end">
        <button
          @click="handleAddCourse"
          :disabled="!newName.trim()"
          class="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 px-4 py-2 rounded-xl transition"
        >
          Simpan Matkul
        </button>
      </div>
    </div>

    <!-- Course Cards List -->
    <div class="space-y-3">
      <div
        v-for="course in courses"
        :key="course.id"
        :class="[
          'bg-white rounded-2xl p-4 border transition shadow-xs',
          course.id === activeCourseId
            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
            : 'border-slate-200/80 hover:border-slate-300'
        ]"
      >
        <!-- Edit Mode -->
        <div v-if="editingId === course.id" class="space-y-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label :for="'edit-name-' + course.id" class="block text-[10px] font-bold text-slate-600 mb-0.5">Nama Matkul</label>
              <input
                :id="'edit-name-' + course.id"
                v-model="editName"
                type="text"
                placeholder="Nama Matkul"
                class="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label :for="'edit-class-' + course.id" class="block text-[10px] font-bold text-slate-600 mb-0.5">Kelas</label>
              <input
                :id="'edit-class-' + course.id"
                v-model="editClassName"
                type="text"
                placeholder="Kelas"
                class="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label :for="'edit-time-' + course.id" class="block text-[10px] font-bold text-slate-600 mb-0.5">Jam Kuliah</label>
              <input
                :id="'edit-time-' + course.id"
                v-model="editTime"
                type="text"
                placeholder="Jam Kuliah"
                class="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label :for="'edit-lecturer-' + course.id" class="block text-[10px] font-bold text-slate-600 mb-0.5">Dosen</label>
              <input
                :id="'edit-lecturer-' + course.id"
                v-model="editLecturer"
                type="text"
                placeholder="Dosen"
                class="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div class="sm:col-span-2">
              <label :for="'edit-code-' + course.id" class="block text-[10px] font-bold text-slate-600 mb-0.5">Kode Matkul</label>
              <input
                :id="'edit-code-' + course.id"
                v-model="editCode"
                type="text"
                placeholder="Kode"
                class="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div class="flex justify-end gap-1.5 pt-1">
            <button
              @click="editingId = null"
              class="text-xs px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              @click="saveEdit(course.id)"
              class="text-xs px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg"
            >
              Simpan
            </button>
          </div>
        </div>

        <!-- Normal View Mode -->
        <div v-else class="space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 cursor-pointer" @click="emit('selectCourse', course.id)">
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-sm text-slate-800">{{ course.name }}</h3>
                <span
                  v-if="course.id === activeCourseId"
                  class="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full"
                >
                  Aktif Sekarang
                </span>
              </div>
              <div class="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5">
                <span v-if="course.className" class="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {{ course.className }}
                </span>
                <span v-if="course.time" class="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                  {{ course.time }}
                </span>
                <span v-if="course.code" class="font-mono text-slate-600">
                  {{ course.code }}
                </span>
                <span v-if="course.lecturer" class="text-slate-600">
                  {{ course.lecturer }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-1 shrink-0">
              <button
                type="button"
                @click="startEdit(course)"
                class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                title="Edit Matkul"
                :aria-label="`Edit matkul ${course.name}`"
              >
                <Edit2 class="w-4 h-4" />
              </button>
              <button
                v-if="courses.length > 1"
                type="button"
                @click="emit('removeCourse', course.id)"
                class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Hapus Matkul"
                :aria-label="`Hapus matkul ${course.name}`"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Revisi Students Section per Course -->
          <div class="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-slate-600 flex items-center gap-1">
                <Users class="w-3 h-3 text-purple-600" />
                <span>Mahasiswa Revisi: {{ course.customStudents?.length || 0 }} Orang</span>
              </span>
              <button
                type="button"
                @click="emit('openAddGuest', course.id)"
                class="text-[10px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md transition"
              >
                + Tambah Revisi
              </button>
            </div>

            <!-- List of Guest Students in This Course -->
            <div v-if="course.customStudents && course.customStudents.length > 0" class="flex flex-wrap gap-1.5 pt-1">
              <span
                v-for="guest in course.customStudents"
                :key="guest.id"
                class="inline-flex items-center gap-1 bg-white border border-purple-200 text-purple-900 text-[11px] px-2 py-0.5 rounded-lg shadow-2xs"
              >
                <span class="font-mono text-[10px] text-purple-600">{{ guest.nim }}</span>
                <span class="font-medium">{{ guest.name }}</span>
                <button
                  type="button"
                  @click="emit('removeCustomStudent', course.id, guest.id)"
                  class="text-slate-400 hover:text-rose-600 ml-0.5"
                  title="Hapus mahasiswa revisi ini"
                  :aria-label="`Hapus mahasiswa revisi ${guest.name}`"
                >
                  <X class="w-3 h-3" />
                </button>
              </span>
            </div>
            <p v-else class="text-[10px] text-slate-400 italic">
              Tidak ada mahasiswa revisi untuk matkul ini (hanya mahasiswa kelas utama).
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
