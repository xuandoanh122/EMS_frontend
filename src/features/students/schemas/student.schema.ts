import { z } from 'zod'

// student_code: BE tự sinh theo format StudYYMMxxx – FE không gửi
export const studentCreateSchema = z.object({
  full_name: z.string().min(1, 'Họ tên không được để trống').max(150),
  date_of_birth: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional(),
  national_id: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  phone_number: z.string().max(20).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  enrollment_date: z.string().optional().or(z.literal('')),
  academic_status: z.enum(['active', 'preserved', 'suspended', 'graduated']).default('active'),
  // class_name / program_name đã bỏ – thay bằng class_ids (Multi-select Dropdown)
  class_ids: z.array(z.number().int().positive()).optional(),
  parent_full_name: z.string().max(150).optional().or(z.literal('')),
  parent_phone: z.string().max(20).optional().or(z.literal('')),
  parent_email: z.string().email('Email phụ huynh không hợp lệ').optional().or(z.literal('')),
  medical_notes: z.string().optional().or(z.literal('')),
})

// Schema riêng cho edit – không có class_ids (quản lý qua Enrollment API)
export const studentUpdateSchema = studentCreateSchema.omit({ class_ids: true, academic_status: true })

export const studentStatusSchema = z.object({
  new_status: z.enum(['active', 'preserved', 'suspended', 'graduated']),
  reason: z.string().max(500).optional().or(z.literal('')),
})

export type StudentCreateFormValues = z.infer<typeof studentCreateSchema>
export type StudentUpdateFormValues = z.infer<typeof studentUpdateSchema>
export type StudentStatusFormValues = z.infer<typeof studentStatusSchema>
