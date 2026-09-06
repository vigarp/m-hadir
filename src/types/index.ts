export type AttendanceStatus = 'present' | 'permit' | 'sick' | 'absent';

export interface Student {
  id: string;
  nim: string;
  name: string;
  isGuest?: boolean; // Penanda mahasiswa revisi / lintas kelas
}

export interface Course {
  id: string;
  name: string;
  code?: string;
  className?: string; // contoh: 03SIFE003
  lecturer?: string;
  time?: string; // contoh: 07.40 - 09.40 (opsional)
  customStudents?: Student[]; // Mahasiswa revisi / tambahan khusus matkul ini
}

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  meetingNo?: number;
  records: Record<string, AttendanceStatus>; // studentId -> status
  updatedAt: number;
}

export interface AppBackupData {
  version: number;
  exportedAt: string;
  mainStudents: Student[];
  courses: Course[];
  sessions: AttendanceSession[];
}

