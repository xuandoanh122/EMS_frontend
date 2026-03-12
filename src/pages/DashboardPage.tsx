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

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color,
  isLoading,
}: {
  title: string
  value?: number
  icon: typeof Users
  description: string
  color: string
  isLoading: boolean
}) {
  return (
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
    <div>
      <PageHeader
        title="Tổng quan"
        description={`Hệ thống Quản lý Giáo dục — ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <StatCard
          title="Tổng học sinh"
          value={stats?.total_students}
          icon={GraduationCap}
          description="Tất cả hồ sơ trong hệ thống"
          color="bg-blue-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Học sinh đang học"
          value={stats?.active_students}
          icon={TrendingUp}
          description="Trạng thái: Đang học"
          color="bg-emerald-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Tổng giáo viên"
          value={stats?.total_teachers}
          icon={Users}
          description="Tất cả hồ sơ trong hệ thống"
          color="bg-violet-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Giáo viên đang công tác"
          value={stats?.active_teachers}
          icon={BookOpen}
          description="Trạng thái: Đang công tác"
          color="bg-orange-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Tổng lớp học"
          value={stats?.total_classrooms}
          icon={School}
          description="Lớp học trong hệ thống"
          color="bg-teal-600"
          isLoading={isLoading}
        />
      </div>

      {/* Recent data panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Học sinh mới nhất</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/students')}>
              Xem tất cả
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="divide-y">
                {stats?.recent_students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{student.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.student_code} · Lớp {student.class_name ?? '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{formatDate(student.created_at)}</span>
                      <StudentStatusBadge status={student.academic_status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent teachers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Giáo viên mới nhất</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/teachers')}>
              Xem tất cả
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="divide-y">
                {stats?.recent_teachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{teacher.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {teacher.teacher_code} · {teacher.department ?? teacher.specialization ?? '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{formatDate(teacher.created_at)}</span>
                      <TeacherStatusBadge status={teacher.employment_status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
