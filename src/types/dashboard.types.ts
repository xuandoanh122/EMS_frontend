import type { Student } from './student.types'
import type { Teacher } from './teacher.types'

export interface DashboardStats {
  total_students: number
  total_teachers: number
  total_classrooms: number
  active_students: number
  active_teachers: number
  recent_students: Student[]
  recent_teachers: Teacher[]
}
