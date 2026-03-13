import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { studentsApi } from '@/api/students.api'
import { studentKeys } from '../hooks/useStudents'
import type { Student, StudentQueryParams } from '@/types/student.types'
import type { StudentCreateFormValues, StudentUpdateFormValues, StudentStatusFormValues } from '../schemas/student.schema'

/**
 * Student Workflow - Encapsulates all student-related business logic
 * This separates UI logic from business logic, making the code more maintainable
 */
export function useStudentWorkflow() {
    const queryClient = useQueryClient()

    // Dialog state
    const [dialogState, setDialogState] = useState<{
        createOpen: boolean
        editOpen: boolean
        deleteOpen: boolean
        statusOpen: boolean
        selectedStudent: Student | null
    }>({
        createOpen: false,
        editOpen: false,
        deleteOpen: false,
        statusOpen: false,
        selectedStudent: null,
    })

    // Query params state
    const [queryParams, setQueryParams] = useState<StudentQueryParams>({
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

    const openEditDialog = useCallback((student: Student) => {
        setDialogState((prev) => ({ ...prev, editOpen: true, selectedStudent: student }))
    }, [])

    const closeEditDialog = useCallback(() => {
        setDialogState((prev) => ({ ...prev, editOpen: false, selectedStudent: null }))
    }, [])

    const openDeleteDialog = useCallback((student: Student) => {
        setDialogState((prev) => ({ ...prev, deleteOpen: true, selectedStudent: student }))
    }, [])

    const closeDeleteDialog = useCallback(() => {
        setDialogState((prev) => ({ ...prev, deleteOpen: false, selectedStudent: null }))
    }, [])

    const openStatusDialog = useCallback((student: Student) => {
        setDialogState((prev) => ({ ...prev, statusOpen: true, selectedStudent: student }))
    }, [])

    const closeStatusDialog = useCallback(() => {
        setDialogState((prev) => ({ ...prev, statusOpen: false, selectedStudent: null }))
    }, [])

    // Search & filter
    const updateSearch = useCallback((search: string) => {
        setQueryParams((prev) => ({ ...prev, search: search || undefined, page: 1 }))
    }, [])

    const updateStatusFilter = useCallback((status: string | undefined) => {
        setQueryParams((prev) => ({
            ...prev,
            academic_status: status === 'all' ? undefined : (status as StudentQueryParams['academic_status']),
            page: 1,
        }))
    }, [])

    const updatePagination = useCallback((page: number) => {
        setQueryParams((prev) => ({ ...prev, page }))
    }, [])

    // CRUD Handlers
    const handleCreate = useCallback(async (values: StudentCreateFormValues) => {
        const response = await studentsApi.create(values)
        const student = response.data
        if (student) {
            queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
            toast.success(`Đã tạo học sinh ${student.full_name}`)
        }
        closeCreateDialog()
        return student
    }, [queryClient, closeCreateDialog])

    const handleUpdate = useCallback(async (values: StudentUpdateFormValues) => {
        if (!dialogState.selectedStudent) return null
        const response = await studentsApi.update(dialogState.selectedStudent.student_code, values)
        const student = response.data
        if (student) {
            queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
            queryClient.invalidateQueries({ queryKey: studentKeys.detail(dialogState.selectedStudent.student_code) })
            toast.success(`Đã cập nhật ${student.full_name}`)
        }
        closeEditDialog()
        return student
    }, [queryClient, dialogState.selectedStudent, closeEditDialog])

    const handleDelete = useCallback(async () => {
        if (!dialogState.selectedStudent) return
        await studentsApi.softDelete(dialogState.selectedStudent.student_code)
        queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
        toast.success(`Đã xoá học sinh ${dialogState.selectedStudent.full_name}`)
        closeDeleteDialog()
    }, [queryClient, dialogState.selectedStudent, closeDeleteDialog])

    const handleUpdateStatus = useCallback(async (values: StudentStatusFormValues) => {
        if (!dialogState.selectedStudent) return
        await studentsApi.updateStatus(dialogState.selectedStudent.student_code, values)
        queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
        queryClient.invalidateQueries({ queryKey: studentKeys.detail(dialogState.selectedStudent.student_code) })
        toast.success('Đã cập nhật trạng thái học sinh')
        closeStatusDialog()
    }, [queryClient, dialogState.selectedStudent, closeStatusDialog])

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
