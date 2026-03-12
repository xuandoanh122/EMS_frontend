import { Badge } from '@/components/ui/badge'
import type { StudentStatus } from '@/types/student.types'
import type { TeacherStatus } from '@/types/teacher.types'
import { STUDENT_STATUS_LABEL } from '@/types/student.types'
import { TEACHER_STATUS_LABEL } from '@/types/teacher.types'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'

const STUDENT_STATUS_STYLE: Record<StudentStatus, BadgeVariant> = {
  active: 'success',
  preserved: 'warning',
  suspended: 'destructive',
  graduated: 'info',
}

const TEACHER_STATUS_STYLE: Record<TeacherStatus, BadgeVariant> = {
  active: 'success',
  on_leave: 'warning',
  resigned: 'destructive',
  retired: 'secondary',
}

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  return (
    <Badge variant={STUDENT_STATUS_STYLE[status]}>
      {STUDENT_STATUS_LABEL[status]}
    </Badge>
  )
}

export function TeacherStatusBadge({ status }: { status: TeacherStatus }) {
  return (
    <Badge variant={TEACHER_STATUS_STYLE[status]}>
      {TEACHER_STATUS_LABEL[status]}
    </Badge>
  )
}
