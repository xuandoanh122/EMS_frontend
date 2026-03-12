import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, RefreshCw, ArrowUpDown, Users } from 'lucide-react'
import type { Classroom } from '@/types/classroom.types'
import { CLASSROOM_STATUS_LABEL } from '@/types/classroom.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  inactive: 'secondary',
  full: 'destructive',
}

interface ClassroomTableProps {
  classrooms: Classroom[]
  isLoading?: boolean
  onEdit: (classroom: Classroom) => void
  onDelete: (classroom: Classroom) => void
  onStatusChange: (classroom: Classroom) => void
  onViewEnrollments: (classroom: Classroom) => void
}

export function ClassroomTable({
  classrooms,
  isLoading,
  onEdit,
  onDelete,
  onStatusChange,
  onViewEnrollments,
}: ClassroomTableProps) {
  const [sortField, setSortField] = useState<keyof Classroom | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const toggleSort = (field: keyof Classroom) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const sorted = [...classrooms].sort((a, b) => {
    if (!sortField) return 0
    const va = String(a[sortField] ?? '')
    const vb = String(b[sortField] ?? '')
    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (sorted.length === 0) {
    return <EmptyState title="Không có lớp học" description="Thêm lớp học mới để bắt đầu." />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">
            <Button variant="ghost" size="sm" className="-ml-3 h-8 font-medium" onClick={() => toggleSort('class_code')}>
              Mã lớp <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" size="sm" className="-ml-3 h-8 font-medium" onClick={() => toggleSort('class_name')}>
              Tên lớp <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
            </Button>
          </TableHead>
          <TableHead>Năm học</TableHead>
          <TableHead>Khối</TableHead>
          <TableHead>GVCN</TableHead>
          <TableHead>Sĩ số</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="w-[60px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((classroom) => (
          <TableRow key={classroom.id}>
            <TableCell className="font-mono text-xs font-medium">{classroom.class_code}</TableCell>
            <TableCell>
              <div className="font-medium">{classroom.class_name}</div>
              {classroom.description && (
                <div className="text-xs text-muted-foreground truncate max-w-[200px]">{classroom.description}</div>
              )}
            </TableCell>
            <TableCell className="text-sm">{classroom.academic_year ?? '—'}</TableCell>
            <TableCell className="text-sm">{classroom.grade_level ?? '—'}</TableCell>
            <TableCell className="text-sm">
              {classroom.homeroom_teacher_name ?? classroom.homeroom_teacher_code ?? '—'}
            </TableCell>
            <TableCell>
              <span className={`text-sm font-medium ${classroom.current_enrollment >= classroom.max_students ? 'text-destructive' : ''}`}>
                {classroom.current_enrollment}/{classroom.max_students}
              </span>
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[classroom.status] ?? 'outline'}>
                {CLASSROOM_STATUS_LABEL[classroom.status] ?? classroom.status}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewEnrollments(classroom)}>
                    <Users className="mr-2 h-4 w-4" />
                    Danh sách học sinh
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEdit(classroom)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(classroom)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Đổi trạng thái
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(classroom)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xoá
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
