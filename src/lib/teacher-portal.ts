export type GradeScale = 'ielts' | 'standard'
export type AttendanceStatus = 'none' | 'present' | 'absent_unexcused' | 'absent_excused'

export function roundIeltsBand(value: number): number {
  return Math.round(value * 2) / 2
}

export function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10
}

export function computeAverage(values: Array<number | null | undefined>): number | null {
  if (values.length === 0) return null
  for (const value of values) {
    if (typeof value !== 'number' || Number.isNaN(value)) return null
  }
  const sum = values.reduce((acc, value) => acc + (value as number), 0)
  return sum / values.length
}

export function roundByScale(value: number, scale: GradeScale): number {
  return scale === 'ielts' ? roundIeltsBand(value) : roundOneDecimal(value)
}

export function maxScoreByScale(scale: GradeScale): number {
  return scale === 'ielts' ? 9 : 10
}

export function getEvaluationLabel(avg: number | null): string {
  if (avg === null || Number.isNaN(avg)) return '—'
  if (avg >= 8) return 'Giỏi'
  if (avg >= 6.5) return 'Khá'
  if (avg >= 5) return 'Trung bình'
  return 'Yếu'
}

export const ATTENDANCE_ORDER: AttendanceStatus[] = [
  'none',
  'present',
  'absent_unexcused',
  'absent_excused',
]

export function nextAttendanceStatus(current: AttendanceStatus): AttendanceStatus {
  const idx = ATTENDANCE_ORDER.indexOf(current)
  const nextIdx = idx === -1 ? 0 : (idx + 1) % ATTENDANCE_ORDER.length
  return ATTENDANCE_ORDER[nextIdx]
}

export function isAbsent(status: AttendanceStatus): boolean {
  return status === 'absent_unexcused' || status === 'absent_excused'
}

export function countAbsences(statuses: AttendanceStatus[]): number {
  return statuses.reduce((acc, status) => acc + (isAbsent(status) ? 1 : 0), 0)
}

export function shouldHighlightAbsence(
  absences: number,
  totalSessions: number,
  threshold = 0.2,
): boolean {
  if (totalSessions <= 0) return false
  return absences / totalSessions > threshold
}
