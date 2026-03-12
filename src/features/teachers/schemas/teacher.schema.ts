import { z } from 'zod'

export const teacherCreateSchema = z.object({
  teacher_code: z.string().min(1, 'Mã giáo viên không được để trống').max(20),
  full_name: z.string().min(1, 'Họ tên không được để trống').max(150),
  date_of_birth: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional(),
  national_id: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  phone_number: z.string().max(20).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  specialization: z.string().max(200).optional().or(z.literal('')),
  qualification: z.string().max(200).optional().or(z.literal('')),
  join_date: z.string().optional().or(z.literal('')),
  employment_status: z.enum(['active', 'on_leave', 'resigned', 'retired']).default('active'),
  department: z.string().max(200).optional().or(z.literal('')),
})

export const teacherStatusSchema = z.object({
  new_status: z.enum(['active', 'on_leave', 'resigned', 'retired']),
  reason: z.string().max(500).optional().or(z.literal('')),
})

export type TeacherCreateFormValues = z.infer<typeof teacherCreateSchema>
export type TeacherStatusFormValues = z.infer<typeof teacherStatusSchema>
