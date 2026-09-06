import { describe, it, expect } from 'vitest';
import { parseExcelStudentText } from '../utils/parser';

describe('Smart Paste Parser', () => {
  it('parses tab-separated Excel copy-paste text', () => {
    const raw = `2201001\tAhmad Fauzi\n2201002\tAnnisa Putri\n2201003\tBagas Pratama`;
    const result = parseExcelStudentText(raw);

    expect(result.length).toBe(3);
    expect(result[0]).toEqual({ nim: '2201001', name: 'Ahmad Fauzi' });
    expect(result[1]).toEqual({ nim: '2201002', name: 'Annisa Putri' });
    expect(result[2]).toEqual({ nim: '2201003', name: 'Bagas Pratama' });
  });

  it('automatically ignores table headers like NIM and Nama', () => {
    const raw = `NIM\tNama Mahasiswa\n2201001\tAhmad Fauzi\n2201002\tAnnisa Putri`;
    const result = parseExcelStudentText(raw);

    expect(result.length).toBe(2);
    expect(result[0].nim).toBe('2201001');
    expect(result[1].nim).toBe('2201002');
  });

  it('supports comma or semicolon separated values', () => {
    const rawCsv = `2201001;Budi Santoso\n2201002,Citra Dewi`;
    const result = parseExcelStudentText(rawCsv);

    expect(result.length).toBe(2);
    expect(result[0]).toEqual({ nim: '2201001', name: 'Budi Santoso' });
    expect(result[1]).toEqual({ nim: '2201002', name: 'Citra Dewi' });
  });

  it('automatically swaps columns if Name comes before numeric NIM', () => {
    const rawSwapped = `Ahmad Fauzi\t2201001\nAnnisa Putri\t2201002`;
    const result = parseExcelStudentText(rawSwapped);

    expect(result.length).toBe(2);
    expect(result[0]).toEqual({ nim: '2201001', name: 'Ahmad Fauzi' });
    expect(result[1]).toEqual({ nim: '2201002', name: 'Annisa Putri' });
  });

  it('returns empty array when given blank input', () => {
    expect(parseExcelStudentText('')).toEqual([]);
    expect(parseExcelStudentText('   \n\n  ')).toEqual([]);
  });
});

