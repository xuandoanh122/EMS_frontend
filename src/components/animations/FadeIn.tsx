import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type FadeInProps = {
    children: React.ReactNode
    className?: string
    delay?: number
    duration?: number
    direction?: 'up' | 'down' | 'left' | 'right' | 'none'
} & Omit<HTMLMotionProps<'div'>, 'children'>

const directionVariants = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 },
    none: { x: 0, y: 0 },
}

export function FadeIn({
    children,
    className,
    delay = 0,
    duration = 0.3,
    direction = 'up',
    ...props
}: FadeInProps) {
    return (
        <motion.div
            className={cn(className)}
            initial={{ opacity: 0, ...directionVariants[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration, delay, ease: 'easeOut' }}
            {...props}
        >
            {children}
        </motion.div>
    )
}
