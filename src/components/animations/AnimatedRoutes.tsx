import { useLocation, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export function AnimatedRoutes() {
    const location = useLocation()

    return (
        <AnimatePresence mode="sync">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full"
            >
                <Outlet />
            </motion.div>
        </AnimatePresence>
    )
}
