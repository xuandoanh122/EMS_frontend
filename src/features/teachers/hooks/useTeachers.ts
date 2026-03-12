import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { teachersApi } from '@/api/teachers.api'
import type {
  TeacherQueryParams,
  TeacherCreateRequest,
  TeacherUpdateRequest,
  TeacherStatusUpdateRequest,
} from '@/types/teacher.types'
import { omitEmpty } from '@/lib/utils'

export const teacherKeys = {
  all: ['teachers'] as const,
  lists: () => [...teacherKeys.all, 'list'] as const,
  list: (params: TeacherQueryParams) => [...teacherKeys.lists(), params] as const,
  details: () => [...teacherKeys.all, 'detail'] as const,
  detail: (code: string) => [...teacherKeys.details(), code] as const,
}

export function useTeacherList(params: TeacherQueryParams = {}) {
  return useQuery({
    queryKey: teacherKeys.list(params),
    queryFn: () => teachersApi.list(params),
    select: (res) => res.data,
  })
}

export function useTeacherDetail(teacher_code: string) {
  return useQuery({
    queryKey: teacherKeys.detail(teacher_code),
    queryFn: () => teachersApi.getByCode(teacher_code),
    select: (res) => res.data,
    enabled: !!teacher_code,
  })
}

export function useCreateTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TeacherCreateRequest) =>
      teachersApi.create(omitEmpty(payload) as TeacherCreateRequest),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() })
      toast.success(`Đã tạo giáo viên ${res.data?.full_name}`)
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err.response?.data?.detail ?? 'Tạo giáo viên thất bại'
      toast.error(msg)
    },
  })
}

export function useUpdateTeacher(teacher_code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TeacherUpdateRequest) =>
      teachersApi.update(teacher_code, omitEmpty(payload) as TeacherUpdateRequest),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() })
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(teacher_code) })
      toast.success(`Đã cập nhật ${res.data?.full_name}`)
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err.response?.data?.detail ?? 'Cập nhật thất bại'
      toast.error(msg)
    },
  })
}

export function useUpdateTeacherStatus(teacher_code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TeacherStatusUpdateRequest) =>
      teachersApi.updateStatus(teacher_code, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() })
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(teacher_code) })
      toast.success(`Đã cập nhật trạng thái của ${res.data?.full_name}`)
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err.response?.data?.detail ?? 'Cập nhật trạng thái thất bại'
      toast.error(msg)
    },
  })
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (teacher_code: string) => teachersApi.softDelete(teacher_code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() })
      toast.success('Đã xoá giáo viên')
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err.response?.data?.detail ?? 'Xoá thất bại'
      toast.error(msg)
    },
  })
}
