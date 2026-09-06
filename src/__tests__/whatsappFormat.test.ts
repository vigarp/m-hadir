import { describe, it, expect } from 'vitest';
import { formatWhatsAppReport, formatIndonesianDate } from '../utils/whatsappFormatter';
import type { Course, Student, AttendanceStatus } from '../types';

describe('WhatsApp Formatter Utility', () => {
  const sampleCourse: Course = {
    id: 'c-1',
    name: 'ANALISA PROSES BISNIS',
    code: '22SIF0112',
    className: '03SIFE003',
    lecturer: 'FINGKI MARWATI S.Kom., M.Kom.',
    time: '07.40 - 09.40'
  };

  const sampleStudents: Student[] = [
    { id: 's-1', nim: '2201001', name: 'Ahmad Fauzi' },
    { id: 's-2', nim: '2201002', name: 'Annisa Putri' },
    { id: 's-3', nim: '2201003', name: 'Bagas Pratama' },
    { id: 's-4', nim: '2101099', name: 'Rian Permana', isGuest: true }
  ];

  it('formats Indonesian date correctly', () => {
    expect(formatIndonesianDate('2026-09-05')).toBe('Sabtu, 5 September 2026');
    expect(formatIndonesianDate('2026-09-06')).toBe('Minggu, 6 September 2026');
  });

  it('generates header matching university specifications without emojis', () => {
    const report = formatWhatsAppReport({
      course: sampleCourse,
      date: '2026-09-05',
      students: sampleStudents,
      records: {
        's-1': 'present',
        's-2': 'present',
        's-3': 'present',
        's-4': 'present'
      },
      filterMode: 'absent_only'
    });

    // Check header lines in sequence
    expect(report).toContain('*LAPORAN PRESENSI KELAS*');
    expect(report).toContain('ANALISA PROSES BISNIS 22SIF0112');
    expect(report).toContain('03SIFE003');
    expect(report).toContain('FINGKI MARWATI S.Kom., M.Kom.');
    expect(report).toContain('Sabtu, 5 September 2026');
    expect(report).toContain('07.40 - 09.40');

    // No emojis
    expect(report).not.toMatch(/[📋📚🏷️👨‍🏫📅⚠️✅]/);

    // No promotional footer
    expect(report).not.toContain('Dilaporkan oleh Ketua Kelas');
    expect(report).not.toContain('m-hadir');
  });

  it('formats absent students grouped by Izin, Sakit, and Alpa with Revisi badge', () => {
    const records: Record<string, AttendanceStatus> = {
      's-1': 'present',
      's-2': 'permit',
      's-3': 'sick',
      's-4': 'absent' // guest / revisi student
    };

    const report = formatWhatsAppReport({
      course: sampleCourse,
      date: '2026-09-05',
      students: sampleStudents,
      records,
      filterMode: 'absent_only',
      includeNIM: true,
      includeGuestBadge: true
    });

    expect(report).toContain('*DAFTAR TIDAK MASUK (3 orang):*');
    expect(report).toContain('*Izin:*\n1. 2201002 - Annisa Putri');
    expect(report).toContain('*Sakit:*\n2. 2201003 - Bagas Pratama');
    expect(report).toContain('*Alpa / Tanpa Keterangan:*\n3. 2101099 - Rian Permana *(Revisi)*');

    // Summary block
    expect(report).toContain('*RINGKASAN KEHADIRAN:*');
    expect(report).toContain('- Total Mahasiswa: 4');
    expect(report).toContain('- Hadir: 1');
    expect(report).toContain('- Izin: 1');
    expect(report).toContain('- Sakit: 1');
    expect(report).toContain('- Alpa: 1');
  });

  it('shows NIHIL message when all students are present in absent_only mode', () => {
    const report = formatWhatsAppReport({
      course: sampleCourse,
      date: '2026-09-05',
      students: sampleStudents,
      records: {
        's-1': 'present',
        's-2': 'present',
        's-3': 'present',
        's-4': 'present'
      },
      filterMode: 'absent_only'
    });

    expect(report).toContain('_(Semua mahasiswa hadir / NIHIL)_');
  });

  it('lists present students when filterMode is present_only', () => {
    const records: Record<string, AttendanceStatus> = {
      's-1': 'present',
      's-2': 'present',
      's-3': 'absent',
      's-4': 'absent'
    };

    const report = formatWhatsAppReport({
      course: sampleCourse,
      date: '2026-09-05',
      students: sampleStudents,
      records,
      filterMode: 'present_only'
    });

    expect(report).toContain('*DAFTAR MAHASISWA HADIR (2 orang):*');
    expect(report).toContain('1. 2201001 - Ahmad Fauzi');
    expect(report).toContain('2. 2201002 - Annisa Putri');
    expect(report).not.toContain('Bagas Pratama');
  });
});

