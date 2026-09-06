<script setup lang="ts">
import { Clock, Calendar, Trash2, ArrowRight } from 'lucide-vue-next';
import type { AttendanceSession, Course } from '../types';

const props = defineProps<{
  sessions: AttendanceSession[];
  courses: Course[];
}>();

const emit = defineEmits<{
  (e: 'loadSession', courseId: string, date: string): void;
  (e: 'deleteSession', id: string): void;
}>();

function getCourseName(courseId: string) {
  const c = props.courses.find((x) => x.id === courseId);
  return c ? c.name : 'Mata Kuliah Tidak Dikenal';
}

function getSummary(records: Record<string, string>) {
  let present = 0;
  let notPresent = 0;
  Object.values(records).forEach((val) => {
    if (val === 'present') present++;
    else notPresent++;
  });
  return { present, notPresent, total: present + notPresent };
}

function formatIndoDate(dateStr: string) {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}
</script>

<template>
  <div class="space-y-4 pb-20">
    <div>
      <h2 class="text-sm font-bold text-slate-800">Riwayat Presensi Tersimpan</h2>
      <p class="text-xs text-slate-500">Daftar presensi yang pernah dicatat dan tersimpan di HP ini</p>
    </div>

    <div v-if="sessions.length > 0" class="space-y-2.5">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 transition"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
            <Calendar class="w-3.5 h-3.5 text-slate-400" />
            <span class="font-semibold">{{ formatIndoDate(session.date) }}</span>
            <span v-if="session.meetingNo" class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
              Pertemuan {{ session.meetingNo }}
            </span>
          </div>

          <h3 class="font-bold text-xs sm:text-sm text-slate-800 truncate">
            {{ getCourseName(session.courseId) }}
          </h3>

          <!-- Summary Pills -->
          <div class="flex items-center gap-2 mt-2 text-[11px]">
            <span class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
              Hadir: {{ getSummary(session.records).present }}
            </span>
            <span
              :class="[
                'px-2 py-0.5 rounded-md font-bold',
                getSummary(session.records).notPresent > 0
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-500'
              ]"
            >
              Ga Masuk: {{ getSummary(session.records).notPresent }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            @click="emit('loadSession', session.courseId, session.date)"
            class="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-xs flex items-center gap-1 transition active:scale-95"
            title="Buka Presensi Ini"
            :aria-label="`Buka presensi ${getCourseName(session.courseId)} tanggal ${session.date}`"
          >
            <span>Buka</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            @click="emit('deleteSession', session.id)"
            class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            title="Hapus Riwayat Ini"
            :aria-label="`Hapus riwayat presensi ${getCourseName(session.courseId)} tanggal ${session.date}`"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
      <Clock class="w-10 h-10 text-slate-300 mx-auto" />
      <p class="font-bold text-sm text-slate-700">Belum ada riwayat tersimpan</p>
      <p class="text-xs text-slate-500">
        Saat Anda mengisi presensi pada tab "Presensi", sesi akan otomatis tersimpan di sini.
      </p>
    </div>
  </div>
</template>
