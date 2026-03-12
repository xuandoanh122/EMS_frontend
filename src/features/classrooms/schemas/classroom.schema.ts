import { z } from 'zod'

export const classroomCreateSchema = z.object({
  class_code: z.string().min(1, 'Mã lớp là bắt buộc').max(50),
  class_name: z.string().min(1, 'Tên lớp là bắt buộc').max(100),
  academic_year: z.string().optional(),
  grade_level: z.string().optional(),
  max_students: z.coerce.number().int().min(1).max(100).optional(),
  homeroom_teacher_code: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'full']).optional(),
})

export const classroomStatusSchema = z.object({
  new_status: z.enum(['active', 'inactive', 'full']),
  reason: z.string().optional(),
})

export const enrollmentCreateSchema = z.object({
  student_code: z.string().min(1, 'Mã học sinh là bắt buộc'),
  enrollment_date: z.string().optional(),
  notes: z.string().optional(),
})

export type ClassroomCreateFormValues = z.infer<typeof classroomCreateSchema>
export type ClassroomStatusFormValues = z.infer<typeof classroomStatusSchema>
export type EnrollmentCreateFormValues = z.infer<typeof enrollmentCreateSchema>
