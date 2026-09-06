import { describe, it, expect, beforeEach } from 'vitest';
import { useAttendance } from '../composables/useAttendance';
import { useStorage } from '../composables/useStorage';

describe('useAttendance Composable', () => {
  beforeEach(() => {
    localStorage.clear();
    const { addMainStudentsBatch } = useStorage();
    // Reset with 5 distinct students
    addMainStudentsBatch([
      { nim: '2201', name: 'Ahmad Fauzi' },
      { nim: '2202', name: 'Bagas Pratama' },
      { nim: '2203', name: 'Citra Dewi' },
      { nim: '2204', name: 'Dimas Anggara' },
      { nim: '2205', name: 'Eka Lestari' }
    ], true);
  });

  it('initializes session with default present status', () => {
    const { enrolledStudents, stats, initSession } = useAttendance();
    initSession();

    expect(enrolledStudents.value.length).toBeGreaterThanOrEqual(5);
    // By default, everyone is initialized as present for fast KM workflow
    expect(stats.value.present).toBe(enrolledStudents.value.length);
    expect(stats.value.notPresent).toBe(0);
  });

  it('updates student status and computes statistics correctly', () => {
    const { enrolledStudents, setStatus, stats, records, initSession } = useAttendance();
    initSession();

    const student1 = enrolledStudents.value[0].id;
    const student2 = enrolledStudents.value[1].id;
    const student3 = enrolledStudents.value[2].id;

    setStatus(student1, 'permit');
    setStatus(student2, 'sick');
    setStatus(student3, 'absent');

    expect(records.value[student1]).toBe('permit');
    expect(records.value[student2]).toBe('sick');
    expect(records.value[student3]).toBe('absent');

    expect(stats.value.permit).toBe(1);
    expect(stats.value.sick).toBe(1);
    expect(stats.value.absent).toBe(1);
    expect(stats.value.notPresent).toBe(3);
  });

  it('cycles attendance status on single tap', () => {
    const { enrolledStudents, cycleStatus, records, initSession } = useAttendance();
    initSession();

    const id = enrolledStudents.value[0].id;
    expect(records.value[id]).toBe('present');

    cycleStatus(id);
    expect(records.value[id]).toBe('permit');

    cycleStatus(id);
    expect(records.value[id]).toBe('sick');

    cycleStatus(id);
    expect(records.value[id]).toBe('absent');

    cycleStatus(id);
    expect(records.value[id]).toBe('present');
  });

  it('marks all students as present in one tap', () => {
    const { enrolledStudents, setStatus, markAll, stats, initSession } = useAttendance();
    initSession();

    // Mark someone absent first
    setStatus(enrolledStudents.value[0].id, 'absent');
    expect(stats.value.absent).toBe(1);

    // Call mark all
    markAll('present');
    expect(stats.value.present).toBe(enrolledStudents.value.length);
    expect(stats.value.absent).toBe(0);
    expect(stats.value.notPresent).toBe(0);
  });

  it('filters students by search query and status filter', () => {
    const {
      searchQuery,
      statusFilter,
      filteredStudents,
      enrolledStudents,
      setStatus,
      initSession
    } = useAttendance();
    initSession();

    // Search by NIM
    searchQuery.value = '2201';
    expect(filteredStudents.value.length).toBe(1);
    expect(filteredStudents.value[0].name).toBe('Ahmad Fauzi');

    // Search by Name (case-insensitive)
    searchQuery.value = 'bagas';
    expect(filteredStudents.value.length).toBe(1);
    expect(filteredStudents.value[0].nim).toBe('2202');

    // Clear search
    searchQuery.value = '';

    // Filter by status
    setStatus(enrolledStudents.value[0].id, 'absent');
    statusFilter.value = 'absent';
    expect(filteredStudents.value.length).toBe(1);
    expect(filteredStudents.value[0].id).toBe(enrolledStudents.value[0].id);
  });

  it('correctly scopes revisi students to their assigned course only', () => {
    const { addMainStudent, courses, activeCourseId } = useStorage();
    const course1Id = courses.value[0].id;
    const course2Id = courses.value[1].id;

    // Student 1: regular (all courses)
    addMainStudent('22099', 'Siswa Reguler');

    // Student 2: only for course 1
    addMainStudent('21099', 'Siswa Revisi Matkul 1', [course1Id]);

    const { enrolledStudents, initSession } = useAttendance();

    // Check on Course 1
    activeCourseId.value = course1Id;
    initSession();

    const inCourse1 = enrolledStudents.value.find((s) => s.nim === '21099');
    expect(inCourse1).toBeDefined();
    expect(inCourse1?.isGuest).toBe(true);

    // Check on Course 2
    activeCourseId.value = course2Id;
    initSession();

    const inCourse2 = enrolledStudents.value.find((s) => s.nim === '21099');
    expect(inCourse2).toBeUndefined(); // Must NOT appear in course 2!

    const regularInCourse2 = enrolledStudents.value.find((s) => s.nim === '22099');
    expect(regularInCourse2).toBeDefined();
    expect(regularInCourse2?.isGuest).toBe(false);
  });
});
