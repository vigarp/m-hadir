<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStorage } from './composables/useStorage';
import { useAttendance } from './composables/useAttendance';
import Navbar from './components/Navbar.vue';
import StudentList from './components/StudentList.vue';
import CourseManagerView from './components/CourseManagerView.vue';
import StudentManagerView from './components/StudentManagerView.vue';
import HistoryView from './components/HistoryView.vue';
import SmartPasteModal from './components/SmartPasteModal.vue';
import WhatsAppGeneratorModal from './components/WhatsAppGeneratorModal.vue';
import AddGuestModal from './components/AddGuestModal.vue';
import SettingsModal from './components/SettingsModal.vue';
import JsonImportModal from './components/JsonImportModal.vue';
import { ChevronDown } from 'lucide-vue-next';

// Navigation tab
const activeTab = ref<'attendance' | 'students' | 'courses' | 'history'>('attendance');

// Storage & Attendance Composables
const {
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
  deleteSession,
  exportBackup,
  importBackup,
  importJsonSeed
} = useStorage();

const {
  sessionDate,
  meetingNo,
  currentCourse,
  enrolledStudents,
  records,
  searchQuery,
  statusFilter,
  filteredStudents,
  stats,
  setStatus,
  markAll,
  initSession
} = useAttendance();

// Modals State
const showPasteModal = ref(false);
const pasteTargetType = ref<'main' | 'guest'>('main');
const guestTargetCourseId = ref<string>('');

const showGeneratorModal = ref(false);
const showAddGuestModal = ref(false);
const showSettingsModal = ref(false);
const showJsonModal = ref(false);

// PWA Install Prompt handling
const deferredPrompt = ref<any>(null);
const canInstallPwa = ref(false);

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    deferredPrompt.value = e;
    canInstallPwa.value = true;
  });
});

function installPwa() {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt();
    deferredPrompt.value.userChoice.then((choice: any) => {
      if (choice.outcome === 'accepted') {
        canInstallPwa.value = false;
      }
      deferredPrompt.value = null;
    });
  }
}

// Open Smart Paste
function openPasteForMain() {
  pasteTargetType.value = 'main';
  showPasteModal.value = true;
}

function openPasteForGuest(courseId?: string) {
  pasteTargetType.value = 'guest';
  guestTargetCourseId.value = courseId || activeCourseId.value;
  showPasteModal.value = true;
}

function handleImportPaste(data: { students: Array<{ nim: string; name: string }>; replace: boolean }) {
  if (pasteTargetType.value === 'main') {
    addMainStudentsBatch(data.students, data.replace);
  } else {
    // Add to specific course
    const targetCourse = guestTargetCourseId.value || activeCourseId.value;
    data.students.forEach((s) => {
      addCustomStudentToCourse(targetCourse, s);
    });
  }
}

// Open Add Guest Modal
function openAddGuest(courseId?: string) {
  guestTargetCourseId.value = courseId || activeCourseId.value;
  showAddGuestModal.value = true;
}

function handleAddSingleGuest(student: { nim: string; name: string }) {
  const targetCourse = guestTargetCourseId.value || activeCourseId.value;
  addCustomStudentToCourse(targetCourse, student);
}

// Load session from history
function loadHistorySession(courseId: string, date: string) {
  activeCourseId.value = courseId;
  sessionDate.value = date;
  activeTab.value = 'attendance';
  initSession();
}

function handleJsonImport(data: { jsonString: string; replaceCourses: boolean; replaceStudents: boolean }) {
  importJsonSeed(data.jsonString, {
    replaceCourses: data.replaceCourses,
    replaceStudents: data.replaceStudents
  });
  initSession();
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex flex-col justify-between max-w-lg mx-auto shadow-2xl border-x border-slate-200">
    <!-- Navbar Header -->
    <Navbar
      :active-tab="activeTab"
      @navigate="activeTab = $event"
      @open-paste="openPasteForMain"
      @open-settings="showSettingsModal = true"
    />

    <!-- Main Content Body -->
    <main class="flex-1 p-3.5 sm:p-4 overflow-y-auto">
      <!-- TAB 1: PRESENSI -->
      <section v-if="activeTab === 'attendance'" class="space-y-3.5">
        <!-- Course & Session Meta Bar -->
        <div class="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
          <!-- Course Selector Dropdown -->
          <div>
            <label for="course-select" class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Mata Kuliah:
            </label>
            <div class="relative">
              <select
                id="course-select"
                v-model="activeCourseId"
                aria-label="Pilih Mata Kuliah"
                class="w-full text-xs font-bold py-2.5 pl-3 pr-8 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option v-for="c in courses" :key="c.id" :value="c.id">
                  {{ c.name }} {{ c.className ? `[${c.className}]` : '' }} {{ c.code ? `(${c.code})` : '' }}
                </option>
              </select>
              <ChevronDown class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <!-- Date & Pertemuan Row -->
          <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <div>
              <label for="session-date-input" class="block text-[10px] font-bold text-slate-600 mb-0.5">Tanggal Pertemuan</label>
              <div class="relative">
                <input
                  id="session-date-input"
                  v-model="sessionDate"
                  type="date"
                  aria-label="Tanggal Pertemuan"
                  class="w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label for="meeting-no-input" class="block text-[10px] font-bold text-slate-600 mb-0.5">Pertemuan Ke- (opsional)</label>
              <input
                id="meeting-no-input"
                v-model.number="meetingNo"
                type="number"
                min="1"
                max="20"
                placeholder="Contoh: 3"
                aria-label="Pertemuan Ke (opsional)"
                class="w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <!-- Student Attendance List -->
        <StudentList
          :students="filteredStudents"
          :records="records"
          :stats="stats"
          :current-course="currentCourse"
          :search-query="searchQuery"
          :status-filter="statusFilter"
          @update:search-query="searchQuery = $event"
          @update:status-filter="statusFilter = $event"
          @set-status="setStatus"
          @mark-all="markAll"
          @open-generator="showGeneratorModal = true"
          @open-add-guest="openAddGuest()"
          @open-paste-guest="openPasteForGuest()"
        />
      </section>

      <!-- TAB 2: MATA KULIAH -->
      <section v-else-if="activeTab === 'courses'">
        <CourseManagerView
          :courses="courses"
          :active-course-id="activeCourseId"
          @select-course="activeCourseId = $event; activeTab = 'attendance'"
          @add-course="addCourse($event.name, $event.lecturer, $event.code, $event.className, $event.time)"
          @update-course="updateCourse"
          @remove-course="removeCourse"
          @remove-custom-student="removeCustomStudentFromCourse"
          @open-add-guest="openAddGuest($event)"
          @open-json-import="showJsonModal = true"
        />
      </section>

      <!-- TAB 3: DATA MAHASISWA -->
      <section v-else-if="activeTab === 'students'">
        <StudentManagerView
          :students="mainStudents"
          :courses="courses"
          @add-student="addMainStudent($event.nim, $event.name, $event.courseIds)"
          @update-student="updateMainStudent"
          @remove-student="removeMainStudent"
          @open-paste="openPasteForMain"
          @open-json-import="showJsonModal = true"
        />
      </section>

      <!-- TAB 4: RIWAYAT -->
      <section v-else-if="activeTab === 'history'">
        <HistoryView
          :sessions="sessions"
          :courses="courses"
          @load-session="loadHistorySession"
          @delete-session="deleteSession"
        />
      </section>
    </main>

    <!-- Modals -->
    <!-- 1. Smart Paste Modal -->
    <SmartPasteModal
      :is-open="showPasteModal"
      :target-type="pasteTargetType"
      :course-name="currentCourse?.name"
      @close="showPasteModal = false"
      @import="handleImportPaste"
    />

    <!-- 2. WhatsApp Generator Modal -->
    <WhatsAppGeneratorModal
      :is-open="showGeneratorModal"
      :course="currentCourse"
      :date="sessionDate"
      :meeting-no="meetingNo"
      :students="enrolledStudents"
      :records="records"
      @close="showGeneratorModal = false"
    />

    <!-- 3. Add Guest/Revisi Modal -->
    <AddGuestModal
      :is-open="showAddGuestModal"
      :course-name="currentCourse?.name"
      @close="showAddGuestModal = false"
      @add-single="handleAddSingleGuest"
      @open-smart-paste="showAddGuestModal = false; openPasteForGuest()"
    />

    <!-- 4. Settings & Backup Modal -->
    <SettingsModal
      :is-open="showSettingsModal"
      :can-install-pwa="canInstallPwa"
      @close="showSettingsModal = false"
      @export-backup="exportBackup"
      @import-backup="importBackup"
      @install-pwa="installPwa"
      @open-json-import="showJsonModal = true"
    />

    <!-- 5. JSON Bulk Import Modal -->
    <JsonImportModal
      :is-open="showJsonModal"
      @close="showJsonModal = false"
      @import="handleJsonImport"
    />
  </div>
</template>
