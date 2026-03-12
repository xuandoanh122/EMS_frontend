import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { classroomsApi } from '@/api/classrooms.api'
import type {
  ClassroomQueryParams,
  ClassroomCreateRequest,
  ClassroomUpdateRequest,
  ClassroomStatusUpdateRequest,
  EnrollmentCreateRequest,
} from '@/types/classroom.types'
import { omitEmpty } from '@/lib/utils'

export const classroomKeys = {
  all: ['classrooms'] as const,
  lists: () => [...classroomKeys.all, 'list'] as const,
  list: (params: ClassroomQueryParams) => [...classroomKeys.lists(), params] as const,
  details: () => [...classroomKeys.all, 'detail'] as const,
  detail: (code: string) => [...classroomKeys.details(), code] as const,
  enrollments: (code: string) => [...classroomKeys.all, 'enrollments', code] as const,
}

export function useClassroomList(params: ClassroomQueryParams = {}) {
  return useQuery({
    queryKey: classroomKeys.list(params),
    queryFn: () => classroomsApi.list(params),
    select: (res) => res.data,
  })
}

export function useClassroomDetail(class_code: string) {
  return useQuery({
    queryKey: classroomKeys.detail(class_code),
    queryFn: () => classroomsApi.getByCode(class_code),
    select: (res) => res.data,
    enabled: !!class_code,
  })
}

export function useClassroomEnrollments(class_code: string, params: { page?: number; page_size?: number } = {}) {
  return useQuery({
    queryKey: [...classroomKeys.enrollments(class_code), params],
    queryFn: () => classroomsApi.getEnrollments(class_code, params),
    select: (res) => res.data,
    enabled: !!class_code,
  })
}

export function useCreateClassroom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ClassroomCreateRequest) =>
      classroomsApi.create(omitEmpty(payload) as ClassroomCreateRequest),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() })
      toast.success(`Đã tạo lớp ${res.data?.class_name}`)
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err.response?.data?.detail ?? 'Tạo lớp thất bại'
      toast.error(msg)
    },
  })
}

export function useUpdateClassroom(class_code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ClassroomUpdateRequest) =>
      classroomsApi.update(class_code, omitEmpty(payload) as ClassroomUpdateRequest),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() })
      queryClient.invalidateQueries({ queryKey: classroomKeys.detail(class_code) })
      toast.success(`Đã cập nhật lớp ${res.data?.class_name}`)
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err.response?.data?.detail ?? 'Cập nhật thất bại'
      toast.error(msg)
    },
  })
}

export function useUpdateClassroomStatus(class_code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ClassroomStatusUpdateRequest) =>
      classroomsApi.updateStatus(class_code, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() })
      queryClient.invalidateQueries({ queryKey: classroomKeys.detail(class_code) })
      toast.success(`Đã cập nhật trạng thái lớp ${res.data?.class_name}`)
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err.response?.data?.detail ?? 'Cập nhật trạng thái thất bại'
      toast.error(msg)
    },
  })
}

export function useDeleteClassroom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (class_code: string) => classroomsApi.softDelete(class_code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() })
      toast.success('Đã xoá lớp học')
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err.response?.data?.detail ?? 'Xoá thất bại'
      toast.error(msg)
    },
  })
}

export function useAddEnrollment(class_code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: EnrollmentCreateRequest) =>
      classroomsApi.addEnrollment(class_code, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.enrollments(class_code) })
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() })
      toast.success('Đã thêm học sinh vào lớp')
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err.response?.data?.detail ?? 'Thêm học sinh thất bại'
      toast.error(msg)
    },
  })
}

export function useRemoveEnrollment(class_code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (student_code: string) =>
      classroomsApi.removeEnrollment(class_code, student_code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.enrollments(class_code) })
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() })
      toast.success('Đã xoá học sinh khỏi lớp')
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err.response?.data?.detail ?? 'Xoá học sinh thất bại'
      toast.error(msg)
    },
  })
}
