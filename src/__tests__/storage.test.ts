import { describe, it, expect, beforeEach } from 'vitest';
import { useStorage } from '../composables/useStorage';

describe('useStorage Composable', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds a new main student successfully', () => {
    const { mainStudents, addMainStudent } = useStorage();
    const initialCount = mainStudents.value.length;

    const student = addMainStudent('2201999', 'Test Mahasiswa');
    expect(student.nim).toBe('2201999');
    expect(student.name).toBe('Test Mahasiswa');
    expect(mainStudents.value.length).toBe(initialCount + 1);
  });

  it('handles batch student addition with deduplication and replace mode', () => {
    const { mainStudents, addMainStudentsBatch } = useStorage();
    
    // Test batch append
    const batch = [
      { nim: '2201001', name: 'Ahmad Fauzi' }, // Existing NIM in defaults
      { nim: '2201888', name: 'New Student 1' },
      { nim: '2201889', name: 'New Student 2' }
    ];

    const prevCount = mainStudents.value.length;
    addMainStudentsBatch(batch, false);
    // Should only add 2 new students because 2201001 already exists
    expect(mainStudents.value.length).toBe(prevCount + 2);

    // Test replace mode
    addMainStudentsBatch([
      { nim: '99001', name: 'Solo Student' }
    ], true);
    expect(mainStudents.value.length).toBe(1);
    expect(mainStudents.value[0].name).toBe('Solo Student');
  });

  it('creates, updates, and deletes course with code, className, and time', () => {
    const { courses, addCourse, updateCourse, removeCourse } = useStorage();

    const course = addCourse(
      'ANALISA PROSES BISNIS',
      'FINGKI MARWATI S.Kom., M.Kom.',
      '22SIF0112',
      '03SIFE003',
      '07.40 - 09.40'
    );

    expect(course.name).toBe('ANALISA PROSES BISNIS');
    expect(course.code).toBe('22SIF0112');
    expect(course.className).toBe('03SIFE003');
    expect(course.time).toBe('07.40 - 09.40');

    // Update course
    updateCourse(course.id, { name: 'ANALISA PROSES BISNIS LANJUT' });
    const found = courses.value.find((c) => c.id === course.id);
    expect(found?.name).toBe('ANALISA PROSES BISNIS LANJUT');

    // Remove course
    removeCourse(course.id);
    expect(courses.value.some((c) => c.id === course.id)).toBe(false);
  });

  it('supports adding and removing revisi students specifically for a course', () => {
    const { courses, addCourse, addCustomStudentToCourse, removeCustomStudentFromCourse } = useStorage();
    const course = addCourse('SISTEM BASIS DATA');

    addCustomStudentToCourse(course.id, { nim: '2001001', name: 'Budi Revisi' });
    const updatedCourse = courses.value.find((c) => c.id === course.id);
    expect(updatedCourse?.customStudents?.length).toBe(1);
    expect(updatedCourse?.customStudents?.[0].name).toBe('Budi Revisi');
    expect(updatedCourse?.customStudents?.[0].isGuest).toBe(true);

    const guestId = updatedCourse?.customStudents?.[0].id!;
    removeCustomStudentFromCourse(course.id, guestId);
    expect(updatedCourse?.customStudents?.length).toBe(0);
  });

  it('imports valid backup json data correctly', () => {
    const { mainStudents, courses, importBackup } = useStorage();

    const backupJson = JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      mainStudents: [
        { id: 's-backup-1', nim: '12345', name: 'Backup Student' }
      ],
      courses: [
        { id: 'c-backup-1', name: 'Backup Course', className: 'TI-01', customStudents: [] }
      ],
      sessions: []
    });

    const success = importBackup(backupJson);
    expect(success).toBe(true);
    expect(mainStudents.value.length).toBe(1);
    expect(mainStudents.value[0].name).toBe('Backup Student');
    expect(courses.value.length).toBe(1);
    expect(courses.value[0].name).toBe('Backup Course');
  });

  it('supports adding course-scoped student directly in mainStudents', () => {
    const { addMainStudent } = useStorage();
    const student = addMainStudent('21099', 'Siswa Revisi', ['c-1', 'c-2']);
    expect(student.nim).toBe('21099');
    expect(student.courseIds).toEqual(['c-1', 'c-2']);
    expect(student.isGuest).toBe(true);
  });

  it('adds batch courses and imports seed json for both courses and students', () => {
    const { courses, mainStudents, addCoursesBatch, importJsonSeed } = useStorage();

    // 1. Test addCoursesBatch
    const count = addCoursesBatch([
      { name: 'Kecerdasan Buatan', code: 'AI-101', className: 'TI-01' },
      { name: 'Jaringan Komputer', code: 'JK-102', className: 'TI-02' }
    ]);
    expect(count).toBe(2);
    expect(courses.value.some((c) => c.name === 'Kecerdasan Buatan')).toBe(true);

    // 2. Test importJsonSeed with object format and courseNames mapping
    const seedJson = JSON.stringify({
      courses: [
        { name: 'Pemrograman Web', code: 'PW-103', className: '03SIFE' }
      ],
      students: [
        { nim: '23001', name: 'Mhs Reguler' },
        { nim: '21002', name: 'Mhs Revisi', courseNames: ['Pemrograman Web'] }
      ]
    });

    const result = importJsonSeed(seedJson);
    expect(result.coursesAdded).toBeGreaterThanOrEqual(1);
    expect(result.studentsAdded).toBeGreaterThanOrEqual(2);

    const revisiStudent = mainStudents.value.find((s) => s.nim === '21002');
    expect(revisiStudent).toBeDefined();
    expect(revisiStudent?.isGuest).toBe(true);
    expect(revisiStudent?.courseIds?.length).toBe(1);
  });

  it('unlinks course from student in mainStudents when removeCustomStudentFromCourse is called', () => {
    const { addCourse, addMainStudent, mainStudents, removeCustomStudentFromCourse } = useStorage();
    const course = addCourse('ALJABAR LINIER');
    const student = addMainStudent('211011', 'Dimas Revisi', [course.id]);

    expect(student.courseIds).toContain(course.id);
    expect(student.isGuest).toBe(true);

    removeCustomStudentFromCourse(course.id, student.id);

    const updated = mainStudents.value.find((s) => s.id === student.id);
    expect(updated?.courseIds).toBeUndefined();
    expect(updated?.isGuest).toBe(false);
  });
});

