import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useUIStore } from '@/stores/ui.store'
import { FadeIn } from '@/components/animations/FadeIn'

export function Breadcrumbs() {
    const breadcrumbs = useUIStore((state) => state.breadcrumbs)

    if (breadcrumbs.length === 0) return null

    return (
        <FadeIn className="mb-4">
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                <Link
                    to="/"
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                    <Home className="h-4 w-4" />
                    <span>Trang chủ</span>
                </Link>

                {breadcrumbs.map((item, index) => (
                    <span key={index} className="flex items-center gap-1">
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        {item.href ? (
                            <Link
                                to={item.href}
                                className="hover:text-foreground transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-foreground font-medium">{item.label}</span>
                        )}
                    </span>
                ))}
            </nav>
        </FadeIn>
    )
}
