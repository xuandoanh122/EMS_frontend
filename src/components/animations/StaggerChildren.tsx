import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type StaggerChildrenProps = {
    children: React.ReactNode
    className?: string
    delay?: number
    stagger?: number
} & Omit<HTMLMotionProps<'div'>, 'children'>

export function StaggerChildren({
    children,
    className,
    delay = 0,
    stagger = 0.05,
    ...props
}: StaggerChildrenProps) {
    return (
        <motion.div
            className={cn(className)}
            initial="initial"
            animate="animate"
            variants={{
                initial: {},
                animate: {
                    transition: {
                        staggerChildren: stagger,
                        delayChildren: delay,
                    },
                },
            }}
            {...props}
        >
            {children}
        </motion.div>
    )
}

type StaggerItemProps = {
    children: React.ReactNode
    className?: string
    direction?: 'up' | 'down' | 'left' | 'right'
    duration?: number
} & Omit<HTMLMotionProps<'div'>, 'children'>

const itemVariants = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 },
}

export function StaggerItem({
    children,
    className,
    direction = 'up',
    duration = 0.3,
    ...props
}: StaggerItemProps) {
    return (
        <motion.div
            className={cn(className)}
            variants={{
                initial: { opacity: 0, ...itemVariants[direction] },
                animate: {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    transition: { duration, ease: 'easeOut' },
                },
            }}
            {...props}
        >
            {children}
        </motion.div>
    )
}
