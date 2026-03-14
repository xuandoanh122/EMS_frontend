import { useState, useMemo } from 'react'
import { ArrowUpDown } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { StaggerChildren, StaggerItem } from '@/components/animations'

// Column definition type
export interface ColumnDef<T> {
    id: string
    title: string
    accessorKey: keyof T
    sortable?: boolean
    className?: string
    render?: (row: T) => React.ReactNode
}

// Generic DataTable Props
interface DataTableProps<T> {
    data: T[]
    columns: ColumnDef<T>[]
    isLoading?: boolean
    loadingCount?: number
    getRowId: (row: T) => string
    // Sorting
    sortField?: string
    sortDir?: 'asc' | 'desc'
    onSort?: (field: string) => void
    // Row click
    onRowClick?: (row: T) => void
    // Actions column
    renderActions?: (row: T) => React.ReactNode
    // Empty state
    emptyTitle?: string
    emptyDescription?: string
}

export function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    isLoading = false,
    loadingCount = 10,
    getRowId,
    sortField,
    sortDir,
    onSort,
    onRowClick,
    renderActions,
    emptyTitle = 'Không có dữ liệu',
    emptyDescription = 'Không có dữ liệu để hiển thị',
}: DataTableProps<T>) {
    const [internalSort, setInternalSort] = useState<{ field: string; dir: 'asc' | 'desc' } | null>(null)

    const currentSortField = sortField ?? internalSort?.field
    const currentSortDir = sortDir ?? internalSort?.dir

    const handleSort = (field: string) => {
        if (onSort) {
            onSort(field)
        } else {
            setInternalSort((prev) => ({
                field,
                dir: prev?.field === field && prev.dir === 'asc' ? 'desc' : 'asc',
            }))
        }
    }

    // Sort data locally if no external sort
    const sortedData = useMemo(() => {
        if (!currentSortField) return data
        return [...data].sort((a, b) => {
            const aVal = a[currentSortField]
            const bVal = b[currentSortField]
            if (aVal === bVal) return 0
            if (aVal === null || aVal === undefined) return 1
            if (bVal === null || bVal === undefined) return -1
            const comparison = String(aVal).localeCompare(String(bVal))
            return currentSortDir === 'asc' ? comparison : -comparison
        })
    }, [data, currentSortField, currentSortDir])

    // Loading skeleton
    if (isLoading) {
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={col.id} className={col.className}>
                                {col.title}
                            </TableHead>
                        ))}
                        {renderActions && <TableHead className="w-[100px]">Thao tác</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: loadingCount }).map((_, i) => (
                        <TableRow key={i}>
                            {columns.map((col) => (
                                <TableCell key={col.id}>
                                    <Skeleton className="h-4 w-full max-w-[200px]" />
                                </TableCell>
                            ))}
                            {renderActions && (
                                <TableCell>
                                    <Skeleton className="h-8 w-20" />
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    }

    // Empty state
    if (sortedData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-lg font-medium text-foreground">{emptyTitle}</div>
                <div className="text-sm text-muted-foreground mt-1">{emptyDescription}</div>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {columns.map((col) => (
                        <TableHead
                            key={col.id}
                            className={cn(col.sortable && 'cursor-pointer select-none', col.className)}
                        >
                            {col.sortable ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="-ml-4 h-8 data-[sorted=true]:text-foreground"
                                    data-sorted={currentSortField === col.accessorKey}
                                    onClick={() => handleSort(String(col.accessorKey))}
                                >
                                    {col.title}
                                    {currentSortField === col.accessorKey ? (
                                        <ArrowUpDown className={cn('ml-2 h-4 w-4', currentSortDir === 'desc' && 'rotate-180')} />
                                    ) : (
                                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                                    )}
                                </Button>
                            ) : (
                                col.title
                            )}
                        </TableHead>
                    ))}
                    {renderActions && <TableHead className="w-[100px]">Thao tác</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                <StaggerChildren stagger={0.03}>
                    {sortedData.map((row) => {
                        const rowId = getRowId(row)

                        return (
                            <StaggerItem key={rowId}>
                                <TableRow
                                    className={cn(onRowClick && 'cursor-pointer')}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map((col) => (
                                        <TableCell key={col.id} className={col.className}>
                                            {col.render ? col.render(row) : String(row[col.accessorKey] ?? '—')}
                                        </TableCell>
                                    ))}
                                    {renderActions && (
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            {renderActions(row)}
                                        </TableCell>
                                    )}
                                </TableRow>
                            </StaggerItem>
                        )
                    })}
                </StaggerChildren>
            </TableBody>
        </Table>
    )
}
