<script setup lang="ts">
import { Search, CheckCheck, UserPlus, MessageSquare, AlertCircle } from 'lucide-vue-next';
import type { Student, AttendanceStatus, Course } from '../types';

defineProps<{
  students: Student[];
  records: Record<string, AttendanceStatus>;
  stats: {
    total: number;
    present: number;
    permit: number;
    sick: number;
    absent: number;
    notPresent: number;
  };
  currentCourse?: Course;
  searchQuery: string;
  statusFilter: 'all' | AttendanceStatus;
}>();

const emit = defineEmits<{
  (e: 'update:searchQuery', val: string): void;
  (e: 'update:statusFilter', val: 'all' | AttendanceStatus): void;
  (e: 'setStatus', studentId: string, status: AttendanceStatus): void;
  (e: 'markAll', status: AttendanceStatus): void;
  (e: 'openGenerator'): void;
  (e: 'openAddGuest'): void;
  (e: 'openPasteGuest'): void;
}>();

const statusLabels: Record<AttendanceStatus, { short: string; label: string; bg: string; text: string; activeBg: string }> = {
  present: {
    short: 'H',
    label: 'Hadir',
    bg: 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700',
    text: 'text-emerald-700',
    activeBg: 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-600/30'
  },
  permit: {
    short: 'I',
    label: 'Izin',
    bg: 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700',
    text: 'text-amber-700',
    activeBg: 'bg-amber-500 text-white font-bold ring-2 ring-amber-500/30'
  },
  sick: {
    short: 'S',
    label: 'Sakit',
    bg: 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700',
    text: 'text-sky-700',
    activeBg: 'bg-sky-500 text-white font-bold ring-2 ring-sky-500/30'
  },
  absent: {
    short: 'A',
    label: 'Alpa',
    bg: 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700',
    text: 'text-rose-700',
    activeBg: 'bg-rose-600 text-white font-bold ring-2 ring-rose-600/30'
  }
};
</script>

<template>
  <div class="space-y-3 pb-24">
    <!-- Stats Bar Card -->
    <div class="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
      <div class="flex items-center justify-between text-xs">
        <span class="font-bold text-slate-700 flex items-center gap-1.5">
          <span>Ringkasan Kehadiran</span>
          <span class="text-[11px] font-normal text-slate-500">({{ stats.total }} Mahasiswa)</span>
        </span>
        <button
          type="button"
          @click="emit('markAll', 'present')"
          class="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition active:scale-95"
        >
          <CheckCheck class="w-3.5 h-3.5" />
          <span>Semua Hadir</span>
        </button>
      </div>

      <!-- Compact 4 Stats Counter Pill Grid -->
      <div class="grid grid-cols-4 gap-1.5 text-center">
        <button
          type="button"
          @click="emit('update:statusFilter', statusFilter === 'present' ? 'all' : 'present')"
          :class="[
            'py-1.5 px-1 rounded-xl cursor-pointer transition border',
            statusFilter === 'present'
              ? 'bg-emerald-100/80 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-slate-50 border-slate-100 hover:bg-emerald-50/50'
          ]"
        >
          <div class="text-[10px] font-bold text-emerald-800">Hadir</div>
          <div class="text-sm font-black text-slate-800">{{ stats.present }}</div>
        </button>

        <button
          type="button"
          @click="emit('update:statusFilter', statusFilter === 'permit' ? 'all' : 'permit')"
          :class="[
            'py-1.5 px-1 rounded-xl cursor-pointer transition border',
            statusFilter === 'permit'
              ? 'bg-amber-100/80 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-slate-50 border-slate-100 hover:bg-amber-50/50'
          ]"
        >
          <div class="text-[10px] font-bold text-amber-800">Izin</div>
          <div class="text-sm font-black text-slate-800">{{ stats.permit }}</div>
        </button>

        <button
          type="button"
          @click="emit('update:statusFilter', statusFilter === 'sick' ? 'all' : 'sick')"
          :class="[
            'py-1.5 px-1 rounded-xl cursor-pointer transition border',
            statusFilter === 'sick'
              ? 'bg-sky-100/80 border-sky-300 ring-2 ring-sky-500/20'
              : 'bg-slate-50 border-slate-100 hover:bg-sky-50/50'
          ]"
        >
          <div class="text-[10px] font-bold text-sky-800">Sakit</div>
          <div class="text-sm font-black text-slate-800">{{ stats.sick }}</div>
        </button>

        <button
          type="button"
          @click="emit('update:statusFilter', statusFilter === 'absent' ? 'all' : 'absent')"
          :class="[
            'py-1.5 px-1 rounded-xl cursor-pointer transition border',
            statusFilter === 'absent'
              ? 'bg-rose-100/80 border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-slate-50 border-slate-100 hover:bg-rose-50/50'
          ]"
        >
          <div class="text-[10px] font-bold text-rose-800">Alpa</div>
          <div class="text-sm font-black text-slate-800">{{ stats.absent }}</div>
        </button>
      </div>
    </div>

    <!-- Search Box & Filter Chips -->
    <div class="space-y-2">
      <div class="relative">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id="attendance-search-input"
          :value="searchQuery"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text"
          aria-label="Cari NIM atau nama mahasiswa"
          placeholder="Cari NIM atau nama mahasiswa..."
          class="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
        />
      </div>

      <!-- Quick Action: Add Guest/Revisi Student for this course -->
      <div class="flex items-center justify-between gap-2 px-1">
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
          <button
            type="button"
            @click="emit('update:statusFilter', 'all')"
            :class="[
              'px-2.5 py-1 rounded-full font-medium shrink-0 transition',
              statusFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            ]"
          >
            Semua ({{ stats.total }})
          </button>
          <button
            type="button"
            @click="emit('update:statusFilter', 'absent')"
            :class="[
              'px-2.5 py-1 rounded-full font-medium shrink-0 transition',
              statusFilter === 'absent'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
            ]"
          >
            Alpa ({{ stats.absent }})
          </button>
          <button
            type="button"
            @click="emit('update:statusFilter', 'permit')"
            :class="[
              'px-2.5 py-1 rounded-full font-medium shrink-0 transition',
              statusFilter === 'permit'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
            ]"
          >
            Izin ({{ stats.permit }})
          </button>
          <button
            type="button"
            @click="emit('update:statusFilter', 'sick')"
            :class="[
              'px-2.5 py-1 rounded-full font-medium shrink-0 transition',
              statusFilter === 'sick'
                ? 'bg-sky-600 text-white'
                : 'bg-white text-sky-700 border border-sky-200 hover:bg-sky-50'
            ]"
          >
            Sakit ({{ stats.sick }})
          </button>
        </div>

        <button
          type="button"
          @click="emit('openAddGuest')"
          class="shrink-0 text-[11px] font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs transition"
          title="Tambah Mahasiswa Revisi untuk Matkul Ini"
        >
          <UserPlus class="w-3.5 h-3.5 text-emerald-600" />
          <span>+ Revisi</span>
        </button>
      </div>
    </div>

    <!-- Student Cards List -->
    <div class="space-y-2">
      <div
        v-for="(student, idx) in students"
        :key="student.id"
        class="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-2 hover:border-slate-300 transition"
      >
        <!-- Student Info -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[11px] font-semibold text-slate-500">#{{ idx + 1 }}</span>
            <span class="font-mono text-xs font-semibold text-slate-600">{{ student.nim }}</span>
            <span
              v-if="student.isGuest"
              class="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-md border border-purple-200"
            >
              Revisi
            </span>
          </div>
          <div class="font-bold text-xs sm:text-sm text-slate-800 truncate mt-0.5">
            {{ student.name }}
          </div>
        </div>

        <!-- 4-Pill Touch Segmented Selector (H / I / S / A) -->
        <div class="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 gap-1">
          <button
            v-for="(config, statusKey) in statusLabels"
            :key="statusKey"
            type="button"
            @click="emit('setStatus', student.id, statusKey as AttendanceStatus)"
            :class="[
              'w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center active:scale-90',
              (records[student.id] || 'present') === statusKey
                ? config.activeBg
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            ]"
            :title="`Tandai ${config.label} untuk ${student.name}`"
            :aria-label="`Tandai ${config.label} untuk ${student.name}`"
          >
            {{ config.short }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="students.length === 0" class="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
        <AlertCircle class="w-10 h-10 text-slate-300 mx-auto" />
        <div>
          <p class="font-bold text-sm text-slate-700">Tidak ada mahasiswa yang cocok</p>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ searchQuery ? 'Coba ubah kata kunci pencarian' : 'Tambahkan mahasiswa ke kelas atau matkul ini' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Floating Bottom Action Bar for WhatsApp Generator -->
    <div class="fixed bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-md border-t border-slate-200 z-20 pb-safe">
      <div class="max-w-md mx-auto flex items-center gap-2">
        <button
          @click="emit('openGenerator')"
          class="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-98"
        >
          <MessageSquare class="w-4 h-4" />
          <span>Generate Laporan WhatsApp</span>
          <span
            v-if="stats.notPresent > 0"
            class="bg-rose-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full"
          >
            {{ stats.notPresent }} Ga Masuk
          </span>
          <span
            v-else
            class="bg-emerald-800 text-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-full"
          >
            Nihil / Lengkap
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
