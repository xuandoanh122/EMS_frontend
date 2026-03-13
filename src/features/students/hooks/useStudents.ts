import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { studentsApi } from '@/api/students.api'
import type {
  StudentQueryParams,
  StudentCreateRequest,
  StudentUpdateRequest,
  StudentStatusUpdateRequest,
} from '@/types/student.types'
import { omitEmpty } from '@/lib/utils'

export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (params: StudentQueryParams) => [...studentKeys.lists(), params] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (code: string) => [...studentKeys.details(), code] as const,
}

export function useStudentList(params: StudentQueryParams = {}) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => studentsApi.list(params),
    select: (res) => res.data,
  })
}

export function useStudentDetail(student_code: string) {
  return useQuery({
    queryKey: studentKeys.detail(student_code),
    queryFn: () => studentsApi.getByCode(student_code),
    select: (res) => res.data,
    enabled: !!student_code,
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StudentCreateRequest) => {
      const cleaned = omitEmpty(payload as object) as StudentCreateRequest
      if (Array.isArray(cleaned.class_ids) && cleaned.class_ids.length === 0) delete cleaned.class_ids
      return studentsApi.create(cleaned)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
      toast.success(`Đã tạo học sinh ${res.data?.full_name}`)
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err.response?.data?.detail ?? 'Tạo học sinh thất bại'
      toast.error(msg)
    },
  })
}

export function useUpdateStudent(student_code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StudentUpdateRequest) =>
      studentsApi.update(student_code, omitEmpty(payload as object) as StudentUpdateRequest),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(student_code) })
      toast.success(`Đã cập nhật ${res.data?.full_name}`)
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err.response?.data?.detail ?? 'Cập nhật thất bại'
      toast.error(msg)
    },
  })
}

export function useUpdateStudentStatus(student_code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StudentStatusUpdateRequest) =>
      studentsApi.updateStatus(student_code, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(student_code) })
      toast.success(`Đã cập nhật trạng thái của ${res.data?.full_name}`)
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err.response?.data?.detail ?? 'Cập nhật trạng thái thất bại'
      toast.error(msg)
    },
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (student_code: string) => studentsApi.softDelete(student_code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
      toast.success('Đã xoá học sinh')
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err.response?.data?.detail ?? 'Xoá thất bại'
      toast.error(msg)
    },
  })
}
