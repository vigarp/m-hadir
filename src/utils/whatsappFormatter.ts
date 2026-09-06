import type { Course, Student, AttendanceStatus } from '../types';

export interface FormatWhatsAppOptions {
  course?: Course;
  date: string; // YYYY-MM-DD
  meetingNo?: number;
  students: Student[];
  records: Record<string, AttendanceStatus>;
  filterMode: 'absent_only' | 'present_only' | 'all';
  includeNIM?: boolean;
  includeGuestBadge?: boolean;
  includeSummary?: boolean;
  customHeaderNote?: string;
}

export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatWhatsAppReport(opts: FormatWhatsAppOptions): string {
  const {
    course,
    date,
    meetingNo,
    students,
    records,
    filterMode,
    includeNIM = true,
    includeGuestBadge = true,
    includeSummary = true,
    customHeaderNote = ''
  } = opts;

  const lines: string[] = [];

  // Header to-the-point
  lines.push('*LAPORAN PRESENSI KELAS*');
  if (course) {
    const courseTitle = [course.name, course.code].filter(Boolean).join(' ');
    if (courseTitle) lines.push(courseTitle);
    if (course.className) lines.push(course.className);
    if (course.lecturer) lines.push(course.lecturer);
  }

  let dateLine = formatIndonesianDate(date);
  if (meetingNo) {
    dateLine += ` (Pertemuan ${meetingNo})`;
  }
  if (dateLine) lines.push(dateLine);
  if (course?.time) {
    lines.push(course.time);
  }

  if (customHeaderNote.trim()) {
    lines.push(`Catatan: ${customHeaderNote.trim()}`);
  }

  lines.push('');

  // Group students
  const present: Student[] = [];
  const permit: Student[] = [];
  const sick: Student[] = [];
  const absent: Student[] = [];

  students.forEach((s) => {
    const st = records[s.id] || 'present';
    if (st === 'present') present.push(s);
    else if (st === 'permit') permit.push(s);
    else if (st === 'sick') sick.push(s);
    else if (st === 'absent') absent.push(s);
  });

  const notPresent = [...permit, ...sick, ...absent];

  function formatStudentItem(student: Student): string {
    let line = '';
    if (includeNIM && student.nim) {
      line = `${student.nim} - ${student.name}`;
    } else {
      line = `${student.name}`;
    }

    if (includeGuestBadge && student.isGuest) {
      line += ' *(Revisi)*';
    }

    return line;
  }

  if (filterMode === 'absent_only') {
    lines.push(`*DAFTAR TIDAK MASUK (${notPresent.length} orang):*`);
    if (notPresent.length === 0) {
      lines.push('_(Semua mahasiswa hadir / NIHIL)_');
    } else {
      let counter = 1;

      if (permit.length > 0) {
        lines.push('\n*Izin:*');
        permit.forEach((s) => {
          lines.push(`${counter++}. ${formatStudentItem(s)}`);
        });
      }

      if (sick.length > 0) {
        lines.push('\n*Sakit:*');
        sick.forEach((s) => {
          lines.push(`${counter++}. ${formatStudentItem(s)}`);
        });
      }

      if (absent.length > 0) {
        lines.push('\n*Alpa / Tanpa Keterangan:*');
        absent.forEach((s) => {
          lines.push(`${counter++}. ${formatStudentItem(s)}`);
        });
      }
    }
  } else if (filterMode === 'present_only') {
    lines.push(`*DAFTAR MAHASISWA HADIR (${present.length} orang):*`);
    if (present.length === 0) {
      lines.push('_(Tidak ada yang hadir)_');
    } else {
      present.forEach((s, idx) => {
        lines.push(`${idx + 1}. ${formatStudentItem(s)}`);
      });
    }
  } else {
    // Mode All
    lines.push(`*HADIR (${present.length}):*`);
    present.forEach((s, idx) => {
      lines.push(`${idx + 1}. ${formatStudentItem(s)}`);
    });

    if (notPresent.length > 0) {
      lines.push(`\n*TIDAK HADIR (${notPresent.length}):*`);
      if (permit.length > 0) {
        lines.push('*Izin:*');
        permit.forEach((s, idx) => lines.push(` ${idx + 1}. ${formatStudentItem(s)}`));
      }
      if (sick.length > 0) {
        lines.push('*Sakit:*');
        sick.forEach((s, idx) => lines.push(` ${idx + 1}. ${formatStudentItem(s)}`));
      }
      if (absent.length > 0) {
        lines.push('*Alpa:*');
        absent.forEach((s, idx) => lines.push(` ${idx + 1}. ${formatStudentItem(s)}`));
      }
    }
  }

  if (includeSummary) {
    lines.push('\n*RINGKASAN KEHADIRAN:*');
    lines.push(`- Total Mahasiswa: ${students.length}`);
    lines.push(`- Hadir: ${present.length}`);
    lines.push(`- Izin: ${permit.length}`);
    lines.push(`- Sakit: ${sick.length}`);
    lines.push(`- Alpa: ${absent.length}`);
  }

  return lines.join('\n');
}

