import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { teachersApi } from '@/api/teachers.api'
import { teacherKeys } from '../hooks/useTeachers'
import type { Teacher, TeacherQueryParams } from '@/types/teacher.types'
import type { TeacherCreateFormValues, TeacherStatusFormValues } from '../schemas/teacher.schema'

/**
 * Teacher Workflow - Encapsulates all teacher-related business logic
 * This separates UI logic from business logic, making the code more maintainable
 */
export function useTeacherWorkflow() {
    const queryClient = useQueryClient()

    // Dialog state
    const [dialogState, setDialogState] = useState<{
        createOpen: boolean
        editOpen: boolean
        deleteOpen: boolean
        statusOpen: boolean
        selectedTeacher: Teacher | null
    }>({
        createOpen: false,
        editOpen: false,
        deleteOpen: false,
        statusOpen: false,
        selectedTeacher: null,
    })

    // Query params state
    const [queryParams, setQueryParams] = useState<TeacherQueryParams>({
        page: 1,
        page_size: 20,
    })

    // Actions
    const openCreateDialog = useCallback(() => {
        setDialogState((prev) => ({ ...prev, createOpen: true }))
    }, [])

    const closeCreateDialog = useCallback(() => {
        setDialogState((prev) => ({ ...prev, createOpen: false }))
    }, [])

    const openEditDialog = useCallback((teacher: Teacher) => {
        setDialogState((prev) => ({ ...prev, editOpen: true, selectedTeacher: teacher }))
    }, [])

    const closeEditDialog = useCallback(() => {
        setDialogState((prev) => ({ ...prev, editOpen: false, selectedTeacher: null }))
    }, [])

    const openDeleteDialog = useCallback((teacher: Teacher) => {
        setDialogState((prev) => ({ ...prev, deleteOpen: true, selectedTeacher: teacher }))
    }, [])

    const closeDeleteDialog = useCallback(() => {
        setDialogState((prev) => ({ ...prev, deleteOpen: false, selectedTeacher: null }))
    }, [])

    const openStatusDialog = useCallback((teacher: Teacher) => {
        setDialogState((prev) => ({ ...prev, statusOpen: true, selectedTeacher: teacher }))
    }, [])

    const closeStatusDialog = useCallback(() => {
        setDialogState((prev) => ({ ...prev, statusOpen: false, selectedTeacher: null }))
    }, [])

    // Search & filter
    const updateSearch = useCallback((search: string) => {
        setQueryParams((prev) => ({ ...prev, search: search || undefined, page: 1 }))
    }, [])

    const updateStatusFilter = useCallback((status: string | undefined) => {
        setQueryParams((prev) => ({
            ...prev,
            employment_status: status === 'all' ? undefined : (status as TeacherQueryParams['employment_status']),
            page: 1,
        }))
    }, [])

    const updatePagination = useCallback((page: number) => {
        setQueryParams((prev) => ({ ...prev, page }))
    }, [])

    // CRUD Handlers
    const handleCreate = useCallback(async (values: TeacherCreateFormValues) => {
        const response = await teachersApi.create(values)
        const teacher = response.data
        if (teacher) {
            queryClient.invalidateQueries({ queryKey: teacherKeys.lists() })
            toast.success(`Đã tạo giáo viên ${teacher.full_name}`)
        }
        closeCreateDialog()
        return teacher
    }, [queryClient, closeCreateDialog])

    const handleUpdate = useCallback(async (values: TeacherCreateFormValues) => {
        if (!dialogState.selectedTeacher) return null
        const response = await teachersApi.update(dialogState.selectedTeacher.teacher_code, values)
        const teacher = response.data
        if (teacher) {
            queryClient.invalidateQueries({ queryKey: teacherKeys.lists() })
            queryClient.invalidateQueries({ queryKey: teacherKeys.detail(dialogState.selectedTeacher.teacher_code) })
            toast.success(`Đã cập nhật ${teacher.full_name}`)
        }
        closeEditDialog()
        return teacher
    }, [queryClient, dialogState.selectedTeacher, closeEditDialog])

    const handleDelete = useCallback(async () => {
        if (!dialogState.selectedTeacher) return
        await teachersApi.softDelete(dialogState.selectedTeacher.teacher_code)
        queryClient.invalidateQueries({ queryKey: teacherKeys.lists() })
        toast.success(`Đã xoá giáo viên ${dialogState.selectedTeacher.full_name}`)
        closeDeleteDialog()
    }, [queryClient, dialogState.selectedTeacher, closeDeleteDialog])

    const handleUpdateStatus = useCallback(async (values: TeacherStatusFormValues) => {
        if (!dialogState.selectedTeacher) return
        await teachersApi.updateStatus(dialogState.selectedTeacher.teacher_code, values)
        queryClient.invalidateQueries({ queryKey: teacherKeys.lists() })
        queryClient.invalidateQueries({ queryKey: teacherKeys.detail(dialogState.selectedTeacher.teacher_code) })
        toast.success('Đã cập nhật trạng thái giáo viên')
        closeStatusDialog()
    }, [queryClient, dialogState.selectedTeacher, closeStatusDialog])

    return {
        // State
        queryParams,
        dialogState,

        // Dialog actions
        openCreateDialog,
        closeCreateDialog,
        openEditDialog,
        closeEditDialog,
        openDeleteDialog,
        closeDeleteDialog,
        openStatusDialog,
        closeStatusDialog,

        // Query actions
        updateSearch,
        updateStatusFilter,
        updatePagination,

        // CRUD actions
        handleCreate,
        handleUpdate,
        handleDelete,
        handleUpdateStatus,
    }
}
