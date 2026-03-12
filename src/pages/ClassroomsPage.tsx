import { Construction, School } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'

export function ClassroomsPage() {
  return (
    <div>
      <PageHeader
        title="Quản lý Lớp học"
        description="Module đang được phát triển"
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 mb-4">
            <School className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Module đang xây dựng</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Tính năng quản lý lớp học (classrooms, cross-enrollment) sẽ được triển khai
            khi API <code className="bg-gray-100 px-1 rounded">/api/v1/classrooms</code> sẵn sàng.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <Construction className="h-4 w-4" />
            Bước triển khai #2 trong Roadmap
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
