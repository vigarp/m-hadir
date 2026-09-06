import { ref, watch } from 'vue';
import type { Student, Course, AttendanceSession, AppBackupData } from '../types';

const STORAGE_KEYS = {
  MAIN_STUDENTS: 'mhadir_main_students_v1',
  COURSES: 'mhadir_courses_v1',
  SESSIONS: 'mhadir_sessions_v1',
  ACTIVE_COURSE: 'mhadir_active_course_v1',
};

// Initial dummy data for instant testing
const DEFAULT_COURSES: Course[] = [
  {
    id: 'c-1',
    name: 'ANALISA PROSES BISNIS',
    code: '22SIF0112',
    className: '03SIFE003',
    lecturer: 'FINGKI MARWATI S.Kom., M.Kom.',
    time: '07.40 - 09.40',
    customStudents: [
      { id: 'rev-1', nim: '2101099', name: 'Rian Permana (Revisi)', isGuest: true }
    ]
  },
  {
    id: 'c-2',
    name: 'BASIS DATA LANJUT',
    code: '22SIF0113',
    className: '03SIFE003',
    lecturer: 'Ibu Ratna, M.T.',
    time: '10.00 - 12.00',
    customStudents: []
  }
];

const DEFAULT_STUDENTS: Student[] = [
  { id: 's-1', nim: '2201001', name: 'Ahmad Fauzi' },
  { id: 's-2', nim: '2201002', name: 'Annisa Putri' },
  { id: 's-3', nim: '2201003', name: 'Bagas Pratama' },
  { id: 's-4', nim: '2201004', name: 'Citra Dewi' },
  { id: 's-5', nim: '2201005', name: 'Dimas Anggara' },
  { id: 's-6', nim: '2201006', name: 'Eka Lestari' },
  { id: 's-7', nim: '2201007', name: 'Fajar Nugroho' },
  { id: 's-8', nim: '2201008', name: 'Gita Maharani' },
  { id: 's-9', nim: '2201009', name: 'Hadi Prasetyo' },
  { id: 's-10', nim: '2201010', name: 'Indah Permata' }
];

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Failed to parse storage key ${key}:`, err);
    return fallback;
  }
}

function saveJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save storage key ${key}:`, err);
  }
}

// Global shared state across components
const mainStudents = ref<Student[]>(loadJson(STORAGE_KEYS.MAIN_STUDENTS, DEFAULT_STUDENTS));
const courses = ref<Course[]>(loadJson(STORAGE_KEYS.COURSES, DEFAULT_COURSES));
const sessions = ref<AttendanceSession[]>(loadJson(STORAGE_KEYS.SESSIONS, []));
const activeCourseId = ref<string>(loadJson(STORAGE_KEYS.ACTIVE_COURSE, courses.value[0]?.id || ''));

// Persist on changes
watch(mainStudents, (val) => saveJson(STORAGE_KEYS.MAIN_STUDENTS, val), { deep: true });
watch(courses, (val) => saveJson(STORAGE_KEYS.COURSES, val), { deep: true });
watch(sessions, (val) => saveJson(STORAGE_KEYS.SESSIONS, val), { deep: true });
watch(activeCourseId, (val) => saveJson(STORAGE_KEYS.ACTIVE_COURSE, val));

export function useStorage() {
  // --- Student Management ---
  function addMainStudent(nim: string, name: string): Student {
    const student: Student = {
      id: 's-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      nim: nim.trim(),
      name: name.trim()
    };
    mainStudents.value.push(student);
    return student;
  }

  function addMainStudentsBatch(list: Array<{ nim: string; name: string }>, replace = false): number {
    const newStudents: Student[] = list
      .filter((item) => item.name && item.nim)
      .map((item, idx) => ({
        id: 's-' + (Date.now() + idx) + '-' + Math.random().toString(36).substring(2, 6),
        nim: item.nim.trim(),
        name: item.name.trim()
      }));

    if (replace) {
      mainStudents.value = newStudents;
    } else {
      // Append only students with unique NIM
      const existingNims = new Set(mainStudents.value.map((s) => s.nim.toLowerCase()));
      const filtered = newStudents.filter((s) => !existingNims.has(s.nim.toLowerCase()));
      mainStudents.value.push(...filtered);
    }
    return newStudents.length;
  }

  function removeMainStudent(id: string) {
    mainStudents.value = mainStudents.value.filter((s) => s.id !== id);
  }

  function updateMainStudent(id: string, updated: Partial<Student>) {
    const idx = mainStudents.value.findIndex((s) => s.id === id);
    if (idx !== -1) {
      mainStudents.value[idx] = { ...mainStudents.value[idx], ...updated };
    }
  }

  // --- Course Management ---
  function addCourse(name: string, lecturer?: string, code?: string, className?: string, time?: string): Course {
    const course: Course = {
      id: 'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      lecturer: lecturer?.trim() || '',
      code: code?.trim() || '',
      className: className?.trim() || '',
      time: time?.trim() || '',
      customStudents: []
    };
    courses.value.push(course);
    if (!activeCourseId.value) {
      activeCourseId.value = course.id;
    }
    return course;
  }

  function updateCourse(id: string, updated: Partial<Course>) {
    const idx = courses.value.findIndex((c) => c.id === id);
    if (idx !== -1) {
      courses.value[idx] = { ...courses.value[idx], ...updated };
    }
  }

  function removeCourse(id: string) {
    courses.value = courses.value.filter((c) => c.id !== id);
    if (activeCourseId.value === id) {
      activeCourseId.value = courses.value[0]?.id || '';
    }
  }

  function addCustomStudentToCourse(courseId: string, student: { nim: string; name: string }) {
    const course = courses.value.find((c) => c.id === courseId);
    if (!course) return;
    if (!course.customStudents) course.customStudents = [];

    const newGuest: Student = {
      id: 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      nim: student.nim.trim(),
      name: student.name.trim(),
      isGuest: true
    };
    course.customStudents.push(newGuest);
  }

  function removeCustomStudentFromCourse(courseId: string, studentId: string) {
    const course = courses.value.find((c) => c.id === courseId);
    if (course && course.customStudents) {
      course.customStudents = course.customStudents.filter((s) => s.id !== studentId);
    }
  }

  // --- Session Management ---
  function saveSession(session: AttendanceSession) {
    const idx = sessions.value.findIndex(
      (s) => s.courseId === session.courseId && s.date === session.date
    );
    if (idx !== -1) {
      sessions.value[idx] = { ...session, updatedAt: Date.now() };
    } else {
      sessions.value.unshift({ ...session, updatedAt: Date.now() });
    }
  }

  function getSession(courseId: string, date: string): AttendanceSession | undefined {
    return sessions.value.find((s) => s.courseId === courseId && s.date === date);
  }

  function deleteSession(id: string) {
    sessions.value = sessions.value.filter((s) => s.id !== id);
  }

  // --- Backup & Restore ---
  function exportBackup() {
    const data: AppBackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      mainStudents: mainStudents.value,
      courses: courses.value,
      sessions: sessions.value
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `m-hadir-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as Partial<AppBackupData>;
      if (parsed.mainStudents && Array.isArray(parsed.mainStudents)) {
        mainStudents.value = parsed.mainStudents;
      }
      if (parsed.courses && Array.isArray(parsed.courses)) {
        courses.value = parsed.courses;
        if (!courses.value.some((c) => c.id === activeCourseId.value)) {
          activeCourseId.value = courses.value[0]?.id || '';
        }
      }
      if (parsed.sessions && Array.isArray(parsed.sessions)) {
        sessions.value = parsed.sessions;
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }

  return {
    mainStudents,
    courses,
    sessions,
    activeCourseId,
    addMainStudent,
    addMainStudentsBatch,
    removeMainStudent,
    updateMainStudent,
    addCourse,
    updateCourse,
    removeCourse,
    addCustomStudentToCourse,
    removeCustomStudentFromCourse,
    saveSession,
    getSession,
    deleteSession,
    exportBackup,
    importBackup
  };
}

