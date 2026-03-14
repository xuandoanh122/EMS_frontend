import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FadeIn } from '@/components/animations/FadeIn'

interface StepperProps {
    steps: string[]
    currentStep: number
    onStepClick?: (step: number) => void
    className?: string
}

export function Stepper({ steps, currentStep, onStepClick, className }: StepperProps) {
    return (
        <FadeIn className={cn('w-full', className)}>
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep
                    const isCurrent = index === currentStep
                    const isClickable = onStepClick && index <= currentStep

                    return (
                        <div key={index} className="flex items-center flex-1">
                            {/* Step circle */}
                            <button
                                type="button"
                                disabled={!isClickable}
                                onClick={() => isClickable && onStepClick(index)}
                                className={cn(
                                    'relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all',
                                    isCompleted && 'border-green-600 bg-green-600 text-white',
                                    isCurrent && 'border-blue-600 bg-white text-blue-600',
                                    !isCompleted && !isCurrent && 'border-gray-200 bg-white text-gray-400',
                                    isClickable && 'cursor-pointer hover:border-blue-400',
                                    !isClickable && 'cursor-default',
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </button>

                            {/* Step label */}
                            <span
                                className={cn(
                                    'ml-3 hidden text-sm font-medium sm:block',
                                    isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground',
                                )}
                            >
                                {step}
                            </span>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        'mx-4 h-0.5 flex-1 transition-colors',
                                        index < currentStep ? 'bg-green-600' : 'bg-gray-200',
                                    )}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </FadeIn>
    )
}
