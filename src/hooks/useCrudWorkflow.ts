import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Configuration for CRUD operations
 */
interface CrudWorkflowConfig<TData, TResponse> {
    /** Unique key for the query */
    queryKey: readonly unknown[]
    /** API mutation function */
    mutationFn: (data: TData) => Promise<{ data: TResponse }>
    /** Success message or callback */
    onSuccess?: (response: { data: TResponse }) => void | string
    /** Error message or callback */
    onError?: (error: unknown) => string
    /** Invalidate related queries after success */
    invalidateQueries?: readonly unknown[]
}

/**
 * useCrudWorkflow - Hook for managing CRUD operations with workflow states
 * 
 * @example
 * const crud = useCrudWorkflow({
 *   queryKey: studentKeys.lists(),
 *   mutationFn: studentsApi.create,
 *   onSuccess: (res) => `Đã tạo học sinh ${res.data.full_name}`,
 *   invalidateQueries: [studentKeys.lists()],
 * })
 */
export function useCrudWorkflow<TData, TResponse>(config: CrudWorkflowConfig<TData, TResponse>) {
    const queryClient = useQueryClient()

    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        mode: 'create' | 'edit' | 'delete' | 'view' | null
        data: TResponse | null
    }>({
        isOpen: false,
        mode: null,
        data: null,
    })

    const mutation = useMutation({
        mutationFn: config.mutationFn,
        onSuccess: (response) => {
            // Invalidate queries
            if (config.invalidateQueries) {
                config.invalidateQueries.forEach((key) => {
                    queryClient.invalidateQueries({ queryKey: key as unknown[] })
                })
            }

            // Show success message
            const message = config.onSuccess?.(response)
            if (typeof message === 'string') {
                toast.success(message)
            }

            // Close dialog
            setDialogState({ isOpen: false, mode: null, data: null })
        },
        onError: (error) => {
            const message = config.onError?.(error) ?? 'Đã xảy ra lỗi'
            toast.error(message)
        },
    })

    // Dialog actions
    const openCreate = useCallback(() => {
        setDialogState({ isOpen: true, mode: 'create', data: null })
    }, [])

    const openEdit = useCallback((data: TResponse) => {
        setDialogState({ isOpen: true, mode: 'edit', data })
    }, [])

    const openView = useCallback((data: TResponse) => {
        setDialogState({ isOpen: true, mode: 'view', data })
    }, [])

    const openDelete = useCallback((data: TResponse) => {
        setDialogState({ isOpen: true, mode: 'delete', data })
    }, [])

    const closeDialog = useCallback(() => {
        setDialogState({ isOpen: false, mode: null, data: null })
    }, [])

    // Execute mutation
    const execute = useCallback((data: TData) => {
        return mutation.mutateAsync(data)
    }, [mutation])

    return {
        // Dialog state
        isOpen: dialogState.isOpen,
        mode: dialogState.mode,
        data: dialogState.data,

        // Dialog actions
        openCreate,
        openEdit,
        openView,
        openDelete,
        closeDialog,

        // Mutation state
        isPending: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,

        // Execute
        execute,
        reset: mutation.reset,
    }
}

/**
 * useBulkAction - Hook for bulk operations
 */
export function useBulkAction<TItem>(actionConfig: {
    mutationFn: (ids: string[]) => Promise<unknown>
    onSuccess?: () => void
    onError?: (error: unknown) => string
}) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const execute = useCallback(async (ids: string[] = selectedIds) => {
        setIsLoading(true)
        try {
            await actionConfig.mutationFn(ids)
            actionConfig.onSuccess?.()
            setSelectedIds([])
        } catch (error) {
            const message = actionConfig.onError?.(error) ?? 'Thao tác thất bại'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }, [selectedIds, actionConfig])

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((i) => i !== id)
                : [...prev, id]
        )
    }, [])

    const selectAll = useCallback((ids: string[]) => {
        setSelectedIds(ids)
    }, [])

    const clearSelection = useCallback(() => {
        setSelectedIds([])
    }, [])

    return {
        selectedIds,
        isLoading,
        isEmpty: selectedIds.length === 0,
        count: selectedIds.length,
        toggleSelect,
        selectAll,
        clearSelection,
        execute,
    }
}
