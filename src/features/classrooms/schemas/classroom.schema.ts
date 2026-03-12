import { z } from 'zod'

export const classroomCreateSchema = z.object({
  class_code: z.string().min(1, 'Mã lớp là bắt buộc').max(30),
  class_name: z.string().min(1, 'Tên lớp là bắt buộc').max(100),
  class_type: z.enum(['standard', 'specialized', 'advanced']).optional(),
  academic_year: z.string().min(1, 'Năm học là bắt buộc').regex(/^\d{4}-\d{4}$/, 'Định dạng: YYYY-YYYY'),
  grade_level: z.coerce.number().int().min(1).max(13, 'Khối từ 1 đến 13'),
  max_capacity: z.coerce.number().int().min(1).max(200).optional(),
  homeroom_teacher_id: z.coerce.number().int().positive().optional().or(z.literal('')).transform(v => v === '' ? undefined : Number(v)),
  room_number: z.string().max(20).optional(),
  description: z.string().max(300).optional(),
})

export const classroomStatusSchema = z.object({
  new_status: z.string().min(1),
  reason: z.string().optional(),
})

export const enrollmentCreateSchema = z.object({
  student_id: z.coerce.number().int().positive('ID học sinh phải là số nguyên dương'),
  enrollment_type: z.enum(['primary', 'secondary']).optional(),
  enrolled_date: z.string().optional(),
  notes: z.string().max(300).optional(),
})

export type ClassroomCreateFormValues = z.infer<typeof classroomCreateSchema>
export type ClassroomStatusFormValues = z.infer<typeof classroomStatusSchema>
export type EnrollmentCreateFormValues = z.infer<typeof enrollmentCreateSchema>
