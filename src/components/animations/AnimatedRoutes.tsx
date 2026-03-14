import { useEffect } from 'react'
import { useLocation, Outlet } from 'react-router-dom'

export function AnimatedRoutes() {
    const location = useLocation()

    // Reset scroll to top when location changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' })
    }, [location.pathname])

    return <Outlet />
}
