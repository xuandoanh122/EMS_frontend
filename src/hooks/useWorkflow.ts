import { useState, useCallback } from 'react'

/**
 * Type for workflow step
 */
export interface WorkflowStep<T = unknown> {
    id: string
    title: string
    validate?: (data: T) => boolean | string
}

/**
 * Type for workflow state
 */
export interface WorkflowState<T = unknown> {
    currentStep: number
    steps: WorkflowStep<T>[]
    data: T
    isCompleted: boolean
    errors: Record<string, string>
}

/**
 * Options for useWorkflow hook
 */
interface UseWorkflowOptions<T> {
    steps: WorkflowStep<T>[]
    initialData?: Partial<T>
    onComplete?: (data: T) => void
    onStepChange?: (step: number) => void
}

const initialState = {
    currentStep: 0,
    isCompleted: false,
    errors: {} as Record<string, string>,
}

/**
 * useWorkflow - Hook for managing multi-step workflows
 * 
 * @example
 * const workflow = useWorkflow({
 *   steps: [
 *     { id: 'basic', title: 'Thông tin cơ bản' },
 *     { id: 'contact', title: 'Liên hệ' },
 *     { id: 'review', title: 'Xác nhận' },
 *   ],
 *   onComplete: (data) => submitForm(data)
 * })
 */
export function useWorkflow<T extends object>({
    steps,
    initialData,
    onComplete,
    onStepChange,
}: UseWorkflowOptions<T>) {
    const [state, setState] = useState<WorkflowState<T>>({
        ...initialState,
        steps,
        data: initialData as T,
    })

    const currentStepData = state.steps[state.currentStep]

    const setData = useCallback((data: Partial<T> | ((prev: T) => Partial<T>)) => {
        setState((prev) => ({
            ...prev,
            data: typeof data === 'function'
                ? { ...prev.data, ...data(prev.data) }
                : { ...prev.data, ...data },
        }))
    }, [])

    const nextStep = useCallback(() => {
        const step = state.steps[state.currentStep]

        // Validate current step before moving
        if (step?.validate) {
            const result = step.validate(state.data)
            if (result !== true) {
                setState((prev) => ({
                    ...prev,
                    errors: { [step.id]: typeof result === 'string' ? result : 'Vui lòng hoàn thành thông tin' },
                }))
                return false
            }
        }

        // Clear errors for current step
        setState((prev) => {
            const newErrors = { ...prev.errors }
            delete newErrors[currentStepData?.id]
            return { ...prev, errors: newErrors }
        })

        if (state.currentStep < state.steps.length - 1) {
            const next = state.currentStep + 1
            setState((prev) => ({ ...prev, currentStep: next }))
            onStepChange?.(next)
            return true
        }

        // Complete workflow
        setState((prev) => ({ ...prev, isCompleted: true }))
        onComplete?.(state.data)
        return true
    }, [state, currentStepData, onComplete, onStepChange])

    const prevStep = useCallback(() => {
        if (state.currentStep > 0) {
            const newStep = state.currentStep - 1
            setState((prev) => ({ ...prev, currentStep: newStep }))
            onStepChange?.(newStep)
        }
    }, [state.currentStep, onStepChange])

    const goToStep = useCallback((step: number) => {
        if (step >= 0 && step < state.steps.length) {
            setState((prev) => ({ ...prev, currentStep: step }))
            onStepChange?.(step)
        }
    }, [state.steps.length, onStepChange])

    const reset = useCallback(() => {
        setState({
            ...initialState,
            steps,
            data: initialData as T,
        })
    }, [steps, initialData])

    return {
        // State
        currentStep: state.currentStep,
        currentStepData,
        data: state.data,
        isCompleted: state.isCompleted,
        errors: state.errors,
        totalSteps: steps.length,
        isFirstStep: state.currentStep === 0,
        isLastStep: state.currentStep === steps.length - 1,

        // Actions
        setData,
        nextStep,
        prevStep,
        goToStep,
        reset,
    }
}
