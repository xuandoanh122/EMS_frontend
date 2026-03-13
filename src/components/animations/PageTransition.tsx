import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type PageTransitionProps = {
    children: React.ReactNode
    className?: string
} & Omit<HTMLMotionProps<'div'>, 'children'>

export function PageTransition({ children, className, ...props }: PageTransitionProps) {
    return (
        <motion.div
            className={cn(className)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            {...props}
        >
            {children}
        </motion.div>
    )
}
