import { ref, computed, watch } from 'vue';
import { useStorage } from './useStorage';
import type { AttendanceStatus, AttendanceSession, Student } from '../types';

export function useAttendance() {
  const {
    mainStudents,
    courses,
    activeCourseId,
    getSession,
    saveSession
  } = useStorage();

  // Current date formatted as YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const sessionDate = ref<string>(todayStr);
  const meetingNo = ref<number | undefined>(undefined);

  // Active course object
  const currentCourse = computed(() => {
    return courses.value.find((c) => c.id === activeCourseId.value) || courses.value[0];
  });

  // Combined student roster: Regular students (all courses) + course-scoped revisi students + custom course guests
  const enrolledStudents = computed<Student[]>(() => {
    if (!currentCourse.value) return [];
    const activeId = currentCourse.value.id;

    // 1. From mainStudents:
    // - If s.courseIds is empty or undefined: belongs to all courses (regular)
    // - If s.courseIds has values: only include if s.courseIds.includes(activeId), marked as isGuest = true (revisi)
    const fromMain: Student[] = mainStudents.value
      .filter((s) => !s.courseIds || s.courseIds.length === 0 || s.courseIds.includes(activeId))
      .map((s) => {
        const isRevisi = Boolean(s.isGuest || (s.courseIds && s.courseIds.length > 0));
        return {
          ...s,
          isGuest: isRevisi
        };
      });

    // 2. Backward compatibility: course.customStudents
    const custom: Student[] = (currentCourse.value.customStudents || []).map((s) => ({
      ...s,
      isGuest: true
    }));

    // Deduplicate by ID and NIM
    const seenIds = new Set<string>();
    const seenNims = new Set<string>();
    const result: Student[] = [];
    [...fromMain, ...custom].forEach((s) => {
      const nimKey = s.nim.trim().toLowerCase();
      if (!seenIds.has(s.id) && (!nimKey || !seenNims.has(nimKey))) {
        seenIds.add(s.id);
        if (nimKey) seenNims.add(nimKey);
        result.push(s);
      }
    });

    return result;
  });

  // Current attendance records: studentId -> AttendanceStatus
  const records = ref<Record<string, AttendanceStatus>>({});

  // Search and filter states
  const searchQuery = ref<string>('');
  const statusFilter = ref<'all' | AttendanceStatus>('all');

  // Load existing session if exists, otherwise default all to 'present'
  function initSession() {
    if (!currentCourse.value) return;

    const existing = getSession(currentCourse.value.id, sessionDate.value);
    const newRecords: Record<string, AttendanceStatus> = {};

    enrolledStudents.value.forEach((student) => {
      if (existing?.records && existing.records[student.id]) {
        newRecords[student.id] = existing.records[student.id];
      } else {
        newRecords[student.id] = 'present'; // Default to present for ultra-fast workflow
      }
    });

    records.value = newRecords;
    if (existing?.meetingNo) {
      meetingNo.value = existing.meetingNo;
    }
  }

  // Persist session whenever records, course, or date changes
  function persistCurrentSession() {
    if (!currentCourse.value) return;
    const session: AttendanceSession = {
      id: `${currentCourse.value.id}_${sessionDate.value}`,
      courseId: currentCourse.value.id,
      date: sessionDate.value,
      meetingNo: meetingNo.value,
      records: { ...records.value },
      updatedAt: Date.now()
    };
    saveSession(session);
  }

  // Trigger init on course/date change
  watch([activeCourseId, sessionDate], () => {
    initSession();
  }, { immediate: true });

  // Sync new students into records if added later
  watch(enrolledStudents, (newList) => {
    newList.forEach((s) => {
      if (!records.value[s.id]) {
        records.value[s.id] = 'present';
      }
    });
    persistCurrentSession();
  }, { deep: true });

  // Quick actions
  function setStatus(studentId: string, status: AttendanceStatus) {
    records.value[studentId] = status;
    persistCurrentSession();
  }

  function cycleStatus(studentId: string) {
    const current = records.value[studentId] || 'present';
    const sequence: AttendanceStatus[] = ['present', 'permit', 'sick', 'absent'];
    const nextIdx = (sequence.indexOf(current) + 1) % sequence.length;
    records.value[studentId] = sequence[nextIdx];
    persistCurrentSession();
  }

  function markAll(status: AttendanceStatus) {
    const updated: Record<string, AttendanceStatus> = {};
    enrolledStudents.value.forEach((s) => {
      updated[s.id] = status;
    });
    records.value = updated;
    persistCurrentSession();
  }

  // Statistics calculation
  const stats = computed(() => {
    let present = 0;
    let permit = 0;
    let sick = 0;
    let absent = 0;

    const list = enrolledStudents.value;
    list.forEach((s) => {
      const st = records.value[s.id] || 'present';
      if (st === 'present') present++;
      else if (st === 'permit') permit++;
      else if (st === 'sick') sick++;
      else if (st === 'absent') absent++;
    });

    return {
      total: list.length,
      present,
      permit,
      sick,
      absent,
      notPresent: permit + sick + absent
    };
  });

  // Filtered student list according to search query and status filter
  const filteredStudents = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    return enrolledStudents.value.filter((student) => {
      const matchQuery =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.nim.toLowerCase().includes(q);

      const status = records.value[student.id] || 'present';
      const matchFilter = statusFilter.value === 'all' || status === statusFilter.value;

      return matchQuery && matchFilter;
    });
  });

  return {
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
    cycleStatus,
    markAll,
    initSession,
    persistCurrentSession
  };
}

