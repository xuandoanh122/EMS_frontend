import { create } from 'zustand'

export interface BreadcrumbItem {
    label: string
    href?: string
}

interface UIState {
    // Sidebar
    isSidebarOpen: boolean
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void

    // Breadcrumbs
    breadcrumbs: BreadcrumbItem[]
    setBreadcrumbs: (items: BreadcrumbItem[]) => void
    addBreadcrumb: (item: BreadcrumbItem) => void
    clearBreadcrumbs: () => void

    // Global loading
    globalLoading: boolean
    setGlobalLoading: (loading: boolean) => void

    // Toast queue for complex workflows
    toastQueue: Array<{
        type: 'success' | 'error' | 'info' | 'warning'
        message: string
    }>
    addToast: (toast: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void
    clearToastQueue: () => void
}

export const useUIStore = create<UIState>((set) => ({
    // Sidebar
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),

    // Breadcrumbs
    breadcrumbs: [],
    setBreadcrumbs: (items) => set({ breadcrumbs: items }),
    addBreadcrumb: (item) => set((state) => ({
        breadcrumbs: [...state.breadcrumbs, item]
    })),
    clearBreadcrumbs: () => set({ breadcrumbs: [] }),

    // Global loading
    globalLoading: false,
    setGlobalLoading: (loading) => set({ globalLoading: loading }),

    // Toast queue
    toastQueue: [],
    addToast: (toast) => set((state) => ({
        toastQueue: [...state.toastQueue, toast]
    })),
    clearToastQueue: () => set({ toastQueue: [] }),
}))
