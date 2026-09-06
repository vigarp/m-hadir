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
});

