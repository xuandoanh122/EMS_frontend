import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, X, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LookupItem } from '@/api/lookups.api'

interface SearchComboboxProps {
  value?: number
  onChange: (id: number | undefined) => void
  fetchFn: (search: string) => Promise<{ data?: LookupItem[] }>
  queryKey: string[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SearchCombobox({
  value,
  onChange,
  fetchFn,
  queryKey,
  placeholder = 'Tìm kiếm...',
  disabled,
  className,
}: SearchComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [displayLabel, setDisplayLabel] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: [...queryKey, search],
    queryFn: () => fetchFn(search),
    select: (res) => res.data ?? [],
    enabled: open,
    staleTime: 30_000,
  })

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        // Restore display label if selection exists
        if (!value) setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [value])

  const handleSelect = useCallback((item: LookupItem) => {
    onChange(item.id)
    setDisplayLabel(item.label)
    setSearch('')
    setOpen(false)
  }, [onChange])

  const handleClear = () => {
    onChange(undefined)
    setDisplayLabel('')
    setSearch('')
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    setOpen(true)
  }

  const items = data ?? []

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className={cn(
        'flex items-center h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        disabled && 'opacity-50 pointer-events-none',
      )}>
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-2" />
        {value && !open ? (
          <span className="flex-1 truncate text-sm">{displayLabel}</span>
        ) : (
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder={value ? displayLabel || placeholder : placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={handleFocus}
            disabled={disabled}
          />
        )}
        {value ? (
          <button type="button" onClick={handleClear} className="ml-1 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-56 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">Không tìm thấy kết quả</div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  'w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                  value === item.id && 'bg-accent',
                )}
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
