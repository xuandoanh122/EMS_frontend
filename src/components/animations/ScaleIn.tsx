import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type ScaleInProps = {
    children: React.ReactNode
    className?: string
    duration?: number
    delay?: number
} & Omit<HTMLMotionProps<'div'>, 'children'>

export function ScaleIn({
    children,
    className,
    duration = 0.2,
    delay = 0,
    ...props
}: ScaleInProps) {
    return (
        <motion.div
            className={cn(className)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration, delay, ease: 'easeOut' }}
            {...props}
        >
            {children}
        </motion.div>
    )
}

type SlideInProps = {
    children: React.ReactNode
    className?: string
    direction?: 'left' | 'right' | 'top' | 'bottom'
    duration?: number
} & Omit<HTMLMotionProps<'div'>, 'children'>

const slideVariants = {
    left: { x: '-100%' },
    right: { x: '100%' },
    top: { y: '-100%' },
    bottom: { y: '100%' },
}

export function SlideIn({
    children,
    className,
    direction = 'right',
    duration = 0.3,
    ...props
}: SlideInProps) {
    return (
        <motion.div
            className={cn(className)}
            initial={{ opacity: 0, ...slideVariants[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration, ease: 'easeOut' }}
            {...props}
        >
            {children}
        </motion.div>
    )
}
