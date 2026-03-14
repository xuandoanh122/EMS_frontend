import { describe, expect, it } from 'vitest'
import {
  roundIeltsBand,
  roundOneDecimal,
  computeAverage,
  roundByScale,
  nextAttendanceStatus,
  countAbsences,
  shouldHighlightAbsence,
} from './teacher-portal'

describe('teacher portal utils', () => {
  it('rounds IELTS bands to nearest 0.5', () => {
    expect(roundIeltsBand(6.25)).toBe(6.5)
    expect(roundIeltsBand(6.125)).toBe(6)
    expect(roundIeltsBand(6.75)).toBe(7)
  })

  it('rounds standard scores to one decimal', () => {
    expect(roundOneDecimal(6.26)).toBe(6.3)
    expect(roundOneDecimal(6.21)).toBe(6.2)
  })

  it('computes averages only when all scores are present', () => {
    expect(computeAverage([8, 7, 9, 6])).toBe(7.5)
    expect(computeAverage([8, null, 9, 6])).toBeNull()
  })

  it('rounds by scale', () => {
    expect(roundByScale(6.25, 'ielts')).toBe(6.5)
    expect(roundByScale(6.26, 'standard')).toBe(6.3)
  })

  it('cycles attendance status', () => {
    expect(nextAttendanceStatus('none')).toBe('present')
    expect(nextAttendanceStatus('present')).toBe('absent_unexcused')
    expect(nextAttendanceStatus('absent_unexcused')).toBe('absent_excused')
    expect(nextAttendanceStatus('absent_excused')).toBe('none')
  })

  it('counts absences and highlights when above threshold', () => {
    const statuses = ['present', 'absent_unexcused', 'absent_excused', 'present'] as const
    expect(countAbsences([...statuses])).toBe(2)
    expect(shouldHighlightAbsence(2, 10)).toBe(false)
    expect(shouldHighlightAbsence(3, 10)).toBe(true)
  })
})
