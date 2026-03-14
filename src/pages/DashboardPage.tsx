import { useQuery } from '@tanstack/react-query'
import { Users, GraduationCap, BookOpen, TrendingUp, School } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { dashboardApi } from '@/api/dashboard.api'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { StudentStatusBadge } from '@/components/shared/StatusBadge'
import { TeacherStatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import { PageTransition, StaggerChildren, StaggerItem, FadeIn } from '@/components/animations'
import type { StudentStatus } from '@/types/student.types'
import type { TeacherStatus } from '@/types/teacher.types'

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color,
  isLoading,
  delay = 0,
}: {
  title: string
  value?: number
  icon: typeof Users
  description: string
  color: string
  isLoading: boolean
  delay?: number
}) {
  return (
    <StaggerItem delay={delay}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-3xl font-bold">{value?.toLocaleString('vi-VN') ?? '—'}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </CardContent>
      </Card>
    </StaggerItem>
  )
}

function RecentStudentsCard({
  students,
  isLoading,
  onViewAll,
}: {
  students?: Array<{
    id: number
    full_name: string
    student_code: string
    class_name: string | null
    academic_status: string
    created_at: string
  }>
  isLoading: boolean
  onViewAll: () => void
}) {
  return (
    <FadeIn delay={0.3}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Học sinh mới nhất</CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            Xem tất cả
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <StaggerChildren stagger={0.05}>
              {students?.map((student) => (
                <StaggerItem key={student.id}>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{student.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.student_code} · Lớp {student.class_name ?? '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{formatDate(student.created_at)}</span>
                      <StudentStatusBadge status={student.academic_status as StudentStatus} />
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  )
}

function RecentTeachersCard({
  teachers,
  isLoading,
  onViewAll,
}: {
  teachers?: Array<{
    id: number
    full_name: string
    teacher_code: string
    department: string | null
    specialization: string | null
    employment_status: string
    created_at: string
  }>
  isLoading: boolean
  onViewAll: () => void
}) {
  return (
    <FadeIn delay={0.4}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Giáo viên mới nhất</CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            Xem tất cả
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <StaggerChildren stagger={0.05}>
              {teachers?.map((teacher) => (
                <StaggerItem key={teacher.id}>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{teacher.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {teacher.teacher_code} · {teacher.department ?? teacher.specialization ?? '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{formatDate(teacher.created_at)}</span>
                      <TeacherStatusBadge status={teacher.employment_status as TeacherStatus} />
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
    select: (res) => res.data,
  })

  return (
    <PageTransition>
      <div>
        <PageHeader
          title="Tổng quan"
          description={`Hệ thống Quản lý Giáo dục — ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        />

        <StaggerChildren className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6" stagger={0.05}>
          <StatCard
            title="Tổng học sinh"
            value={stats?.total_students}
            icon={GraduationCap}
            description="Tất cả hồ sơ trong hệ thống"
            color="bg-blue-600"
            isLoading={isLoading}
            delay={0}
          />
          <StatCard
            title="Học sinh đang học"
            value={stats?.active_students}
            icon={TrendingUp}
            description="Trạng thái: Đang học"
            color="bg-emerald-600"
            isLoading={isLoading}
            delay={0.05}
          />
          <StatCard
            title="Tổng giáo viên"
            value={stats?.total_teachers}
            icon={Users}
            description="Tất cả hồ sơ trong hệ thống"
            color="bg-violet-600"
            isLoading={isLoading}
            delay={0.1}
          />
          <StatCard
            title="Giáo viên đang công tác"
            value={stats?.active_teachers}
            icon={BookOpen}
            description="Trạng thái: Đang công tác"
            color="bg-orange-500"
            isLoading={isLoading}
            delay={0.15}
          />
          <StatCard
            title="Tổng lớp học"
            value={stats?.total_classrooms}
            icon={School}
            description="Lớp học trong hệ thống"
            color="bg-teal-600"
            isLoading={isLoading}
            delay={0.2}
          />
        </StaggerChildren>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentStudentsCard
            students={stats?.recent_students}
            isLoading={isLoading}
            onViewAll={() => navigate('/admin/students')}
          />
          <RecentTeachersCard
            teachers={stats?.recent_teachers}
            isLoading={isLoading}
            onViewAll={() => navigate('/admin/teachers')}
          />
        </div>
      </div>
    </PageTransition>
  )
}
