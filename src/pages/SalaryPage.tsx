import { Construction, Banknote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'

export function SalaryPage() {
  return (
    <div>
      <PageHeader
        title="Quản lý Lương"
        description="Module đang được phát triển"
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 mb-4">
            <Banknote className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Module đang xây dựng</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Tính năng bảng lương, ngạch bậc lương và tính thưởng KPI sẽ được triển khai
            khi API <code className="bg-gray-100 px-1 rounded">/api/v1/salary</code> sẵn sàng.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <Construction className="h-4 w-4" />
            Bước triển khai #5 trong Roadmap
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
