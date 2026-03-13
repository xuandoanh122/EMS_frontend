import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, X, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { LookupItem } from '@/api/lookups.api'

interface MultiLookupSelectProps {
  value: number[]
  onChange: (ids: number[]) => void
  fetchFn: (search: string) => Promise<{ data?: LookupItem[] }>
  queryKey: string[]
  placeholder?: string
  disabled?: boolean
}

export function MultiLookupSelect({
  value,
  onChange,
  fetchFn,
  queryKey,
  placeholder = 'Tìm kiếm...',
  disabled,
}: MultiLookupSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedItems, setSelectedItems] = useState<LookupItem[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: [...queryKey, search],
    queryFn: () => fetchFn(search),
    select: (res) => res.data ?? [],
    enabled: open,
    staleTime: 30_000,
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (item: LookupItem) => {
    if (value.includes(item.id)) return
    const newIds = [...value, item.id]
    const newItems = [...selectedItems, item]
    onChange(newIds)
    setSelectedItems(newItems)
    setSearch('')
  }

  const handleRemove = (id: number) => {
    onChange(value.filter((v) => v !== id))
    setSelectedItems(selectedItems.filter((i) => i.id !== id))
  }

  const items = (data ?? []).filter((i) => !value.includes(i.id))

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          'min-h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background cursor-text',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          disabled && 'opacity-50 pointer-events-none',
        )}
        onClick={() => setOpen(true)}
      >
        <div className="flex flex-wrap gap-1.5 items-center">
          {selectedItems.map((item) => (
            <Badge key={item.id} variant="secondary" className="flex items-center gap-1 text-xs">
              {item.label}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(item.id) }}
                className="ml-0.5 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <div className="flex items-center flex-1 min-w-[120px] gap-1">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
              placeholder={value.length === 0 ? placeholder : 'Thêm lớp...'}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              disabled={disabled}
            />
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              {search ? 'Không tìm thấy' : 'Không có lớp nào'}
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleSelect(item)}
              >
                <div className="font-medium">{item.label}</div>
                {item.sub_label && <div className="text-xs text-muted-foreground">{item.sub_label}</div>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
