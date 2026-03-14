import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Search,
  X,
  BookOpen,
  ClipboardList,
  BarChart2,
  Eye,
  Pencil,
  Settings2,
  History,
  Upload,
  UserCheck,
} from 'lucide-react'
import { gradingApi } from '@/api/grading.api'
import type {
  Subject,
  ClassSubject,
  GradeComponent,
  StudentGrade,
  SubjectQueryParams,
  ClassSubjectQueryParams,
} from '@/types/grading.types'
import { SUBJECT_TYPE_LABEL, ACADEMIC_RANK_LABEL, ACADEMIC_RANK_COLOR } from '@/types/grading.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/EmptyState'
import { TablePagination } from '@/components/shared/TablePagination'

// ── Zod Schemas ───────────────────────────────────────────────────────────────
const subjectSchema = z.object({
  subject_code: z.string().min(1, 'Mã môn là bắt buộc').max(20),
  subject_name: z.string().min(1, 'Tên môn là bắt buộc').max(100),
  subject_type: z.enum(['standard', 'elective', 'extra']).optional(),
  credits: z.coerce.number().int().min(1).max(10).optional(),
  description: z.string().max(300).optional(),
})

const classSubjectSchema = z.object({
  classroom_id: z.coerce.number().int().positive('Classroom ID là bắt buộc'),
  subject_id: z.coerce.number().int().positive('Subject ID là bắt buộc'),
  teacher_id: z.coerce.number().int().positive().optional().or(z.literal('')).transform(v => v === '' ? undefined : Number(v)),
  semester: z.coerce.number().int().min(1).max(2) as z.ZodType<1 | 2>,
  academic_year: z.string().min(1, 'Năm học là bắt buộc').regex(/^\d{4}-\d{4}$/),
})

const classSubjectUpdateSchema = z.object({
  teacher_id: z.coerce.number().int().positive().optional().or(z.literal('')).transform(v => v === '' ? undefined : Number(v)),
  is_active: z.boolean().optional(),
})

const gradeComponentSchema = z.object({
  component_name: z.string().min(1, 'Tên thành phần là bắt buộc').max(100),
  weight_percent: z.coerce.number().int().min(1).max(100),
  min_count: z.coerce.number().int().min(1).optional(),
})

const gradeComponentUpdateSchema = z.object({
  component_name: z.string().min(1).max(100).optional(),
  weight_percent: z.coerce.number().int().min(1).max(100).optional(),
  min_count: z.coerce.number().int().min(1).optional(),
  is_active: z.boolean().optional(),
})

const gradeCreateSchema = z.object({
  student_id: z.coerce.number().int().positive('Student ID là bắt buộc'),
  grade_component_id: z.coerce.number().int().positive('Thành phần điểm là bắt buộc'),
  score: z.coerce.number().min(0).max(10),
  exam_date: z.string().optional(),
})

const gradeBulkSchema = z.object({
  grade_component_id: z.coerce.number().int().positive('Thành phần điểm là bắt buộc'),
  exam_date: z.string().optional(),
  bulk_input: z.string().min(1, 'Nhập danh sách điểm'),
})

const gradeUpdateSchema = z.object({
  score: z.coerce.number().min(0).max(10),
  reason: z.string().min(1, 'Lý do sửa điểm là bắt buộc').max(300),
})

type SubjectFormValues = z.infer<typeof subjectSchema>
type ClassSubjectFormValues = z.infer<typeof classSubjectSchema>
type ClassSubjectUpdateFormValues = z.infer<typeof classSubjectUpdateSchema>
type GradeComponentFormValues = z.infer<typeof gradeComponentSchema>
type GradeComponentUpdateFormValues = z.infer<typeof gradeComponentUpdateSchema>
type GradeCreateFormValues = z.infer<typeof gradeCreateSchema>
type GradeBulkFormValues = z.infer<typeof gradeBulkSchema>
type GradeUpdateFormValues = z.infer<typeof gradeUpdateSchema>

// ── Query Keys ────────────────────────────────────────────────────────────────
const gradingKeys = {
  subjects: (p: SubjectQueryParams) => ['grading', 'subjects', p] as const,
  classSubjects: (p: ClassSubjectQueryParams) => ['grading', 'class-subjects', p] as const,
  components: (cs_id: number) => ['grading', 'grade-components', cs_id] as const,
  grades: (cs_id: number, p: object) => ['grading', 'grades', cs_id, p] as const,
  statistics: (cs_id: number) => ['grading', 'statistics', cs_id] as const,
  auditLogs: (grade_id: number) => ['grading', 'audit-logs', grade_id] as const,
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useSubjects(params: SubjectQueryParams = {}) {
  return useQuery({
    queryKey: gradingKeys.subjects(params),
    queryFn: () => gradingApi.subjects.list(params),
    select: (res) => res.data,
  })
}

function useClassSubjects(params: ClassSubjectQueryParams = {}) {
  return useQuery({
    queryKey: gradingKeys.classSubjects(params),
    queryFn: () => gradingApi.classSubjects.list(params),
    select: (res) => res.data,
  })
}

function useGradeComponents(cs_id: number) {
  return useQuery({
    queryKey: gradingKeys.components(cs_id),
    queryFn: () => gradingApi.gradeComponents.listByClassSubject(cs_id),
    select: (res) => res.data ?? [],
    enabled: cs_id > 0,
  })
}

function useClassSubjectGrades(cs_id: number, params = {}) {
  return useQuery({
    queryKey: gradingKeys.grades(cs_id, params),
    queryFn: () => gradingApi.classSubjects.getGrades(cs_id, params),
    select: (res) => res.data,
    enabled: cs_id > 0,
  })
}

function useClassSubjectStatistics(cs_id: number) {
  return useQuery({
    queryKey: gradingKeys.statistics(cs_id),
    queryFn: () => gradingApi.classSubjects.getStatistics(cs_id),
    select: (res) => res.data,
    enabled: cs_id > 0,
  })
}

function useAuditLogs(grade_id: number) {
  return useQuery({
    queryKey: gradingKeys.auditLogs(grade_id),
    queryFn: () => gradingApi.grades.getAuditLogs(grade_id),
    select: (res) => res.data ?? [],
    enabled: grade_id > 0,
  })
}

// ── SubjectTab ────────────────────────────────────────────────────────────────
function SubjectTab() {
  const [subjectParams, setSubjectParams] = useState<SubjectQueryParams>({ page: 1, page_size: 20, active_only: true })
  const [searchInput, setSearchInput] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editSubject, setEditSubject] = useState<Subject | null>(null)
  const queryClient = useQueryClient()

  const { data: subjectData, isLoading } = useSubjects(subjectParams)

  const createSubjectMutation = useMutation({
    mutationFn: gradingApi.subjects.create,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'subjects'] })
      toast.success(`Đã tạo môn học "${res.data?.subject_name}"`)
      setCreateOpen(false)
      createForm.reset()
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail ?? 'Tạo môn học thất bại')
    },
  })

  const updateSubjectMutation = useMutation({
    mutationFn: ({ code, payload }: { code: string; payload: Partial<SubjectFormValues> & { is_active?: boolean } }) =>
      gradingApi.subjects.update(code, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'subjects'] })
      toast.success('Đã cập nhật môn học')
      setEditSubject(null)
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail ?? 'Cập nhật thất bại')
    },
  })

  const createForm = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { subject_code: '', subject_name: '', subject_type: 'standard', credits: 1, description: '' },
  })

  const editForm = useForm<SubjectFormValues & { is_active?: boolean }>({
    resolver: zodResolver(subjectSchema),
    values: editSubject ? {
      subject_code: editSubject.subject_code,
      subject_name: editSubject.subject_name,
      subject_type: editSubject.subject_type,
      credits: editSubject.credits,
      description: editSubject.description ?? '',
    } : undefined,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm môn học..."
            className="pl-9 w-64"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSubjectParams(p => ({ ...p, search: searchInput || undefined, page: 1 }))}
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setSubjectParams(p => ({ ...p, search: undefined })) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Thêm môn học
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : subjectData?.items.length === 0 ? (
        <EmptyState title="Chưa có môn học" description="Thêm môn học để bắt đầu." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã môn</TableHead>
              <TableHead>Tên môn học</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Số tín chỉ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjectData?.items.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-mono text-xs font-medium">{subject.subject_code}</TableCell>
                <TableCell>
                  <div className="font-medium">{subject.subject_name}</div>
                  {subject.description && <div className="text-xs text-muted-foreground truncate max-w-xs">{subject.description}</div>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{SUBJECT_TYPE_LABEL[subject.subject_type]}</Badge>
                </TableCell>
                <TableCell className="text-sm">{subject.credits}</TableCell>
                <TableCell>
                  <Badge variant={subject.is_active ? 'default' : 'secondary'}>
                    {subject.is_active ? 'Đang dùng' : 'Đã dừng'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditSubject(subject)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {subjectData && subjectData.total_pages > 1 && (
        <TablePagination
          page={subjectData.page}
          totalPages={subjectData.total_pages}
          total={subjectData.total}
          pageSize={subjectData.page_size}
          onPageChange={(p) => setSubjectParams(prev => ({ ...prev, page: p }))}
        />
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) createForm.reset() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Thêm môn học mới</DialogTitle></DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit((v) => createSubjectMutation.mutate(v))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={createForm.control} name="subject_code" render={({ field }) => (
                  <FormItem><FormLabel>Mã môn <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="VD: TOAN" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={createForm.control} name="subject_name" render={({ field }) => (
                  <FormItem><FormLabel>Tên môn <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="VD: Toán học" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={createForm.control} name="subject_type" render={({ field }) => (
                  <FormItem><FormLabel>Loại môn</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Bắt buộc</SelectItem>
                        <SelectItem value="elective">Tự chọn</SelectItem>
                        <SelectItem value="extra">Ngoại khóa</SelectItem>
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={createForm.control} name="credits" render={({ field }) => (
                  <FormItem><FormLabel>Số tín chỉ</FormLabel>
                    <FormControl><Input type="number" min={1} max={10} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={createForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Mô tả</FormLabel>
                  <FormControl><Input placeholder="Mô tả môn học..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>Huỷ</Button>
                <Button type="submit" disabled={createSubjectMutation.isPending}>
                  {createSubjectMutation.isPending ? 'Đang lưu...' : 'Tạo môn học'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editSubject} onOpenChange={(o) => !o && setEditSubject(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Chỉnh sửa môn học</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((v) => editSubject && updateSubjectMutation.mutate({ code: editSubject.subject_code, payload: v }))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="subject_name" render={({ field }) => (
                  <FormItem><FormLabel>Tên môn <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={editForm.control} name="credits" render={({ field }) => (
                  <FormItem><FormLabel>Số tín chỉ</FormLabel>
                    <FormControl><Input type="number" min={1} max={10} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={editForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Mô tả</FormLabel>
                  <FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              {/* Toggle active */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-sm font-medium">Trạng thái:</span>
                <Button
                  type="button"
                  variant={editSubject?.is_active ? 'destructive' : 'default'}
                  size="sm"
                  onClick={() => editSubject && updateSubjectMutation.mutate({
                    code: editSubject.subject_code,
                    payload: { is_active: !editSubject.is_active },
                  })}
                  disabled={updateSubjectMutation.isPending}
                >
                  {editSubject?.is_active ? 'Dừng sử dụng' : 'Kích hoạt'}
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setEditSubject(null)}>Huỷ</Button>
                <Button type="submit" disabled={updateSubjectMutation.isPending}>
                  {updateSubjectMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── ClassSubjectTab ───────────────────────────────────────────────────────────
function ClassSubjectTab() {
  const [csParams, setCsParams] = useState<ClassSubjectQueryParams>({ page: 1, page_size: 20 })
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedCS, setSelectedCS] = useState<ClassSubject | null>(null)
  const [componentsOpen, setComponentsOpen] = useState(false)
  const [gradesOpen, setGradesOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [editCSOpen, setEditCSOpen] = useState(false)

  // Grade dialogs
  const [addGradeOpen, setAddGradeOpen] = useState(false)
  const [bulkGradeOpen, setBulkGradeOpen] = useState(false)
  const [editGrade, setEditGrade] = useState<StudentGrade | null>(null)
  const [auditGrade, setAuditGrade] = useState<StudentGrade | null>(null)

  // Component edit
  const [editComponent, setEditComponent] = useState<GradeComponent | null>(null)

  const queryClient = useQueryClient()

  const { data: csData, isLoading } = useClassSubjects(csParams)
  const { data: components, isLoading: loadingComponents } = useGradeComponents(selectedCS?.id ?? 0)
  const { data: gradesData, isLoading: loadingGrades } = useClassSubjectGrades(selectedCS?.id ?? 0)
  const { data: stats } = useClassSubjectStatistics(selectedCS?.id ?? 0)
  const { data: auditLogs, isLoading: loadingAudit } = useAuditLogs(auditGrade?.id ?? 0)

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createCSMutation = useMutation({
    mutationFn: gradingApi.classSubjects.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'class-subjects'] })
      toast.success('Đã phân công môn học')
      setCreateOpen(false)
      csForm.reset()
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail ?? 'Phân công thất bại')
    },
  })

  const updateCSMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { teacher_id?: number; is_active?: boolean } }) =>
      gradingApi.classSubjects.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'class-subjects'] })
      toast.success('Đã cập nhật phân công')
      setEditCSOpen(false)
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail ?? 'Cập nhật thất bại')
    },
  })

  const createComponentMutation = useMutation({
    mutationFn: (payload: { class_subject_id: number; component_name: string; weight_percent: number; min_count?: number }) =>
      gradingApi.gradeComponents.create(payload),
    onSuccess: () => {
      if (selectedCS) queryClient.invalidateQueries({ queryKey: gradingKeys.components(selectedCS.id) })
      toast.success('Đã thêm thành phần điểm')
      compForm.reset()
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail ?? 'Thêm thành phần thất bại')
    },
  })

  const updateComponentMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: GradeComponentUpdateFormValues }) =>
      gradingApi.gradeComponents.update(id, payload),
    onSuccess: () => {
      if (selectedCS) queryClient.invalidateQueries({ queryKey: gradingKeys.components(selectedCS.id) })
      toast.success('Đã cập nhật thành phần điểm')
      setEditComponent(null)
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail ?? 'Cập nhật thất bại')
    },
  })

  const createGradeMutation = useMutation({
    mutationFn: gradingApi.grades.create,
    onSuccess: () => {
      if (selectedCS) queryClient.invalidateQueries({ queryKey: ['grading', 'grades', selectedCS.id] })
      toast.success('Đã nhập điểm')
      setAddGradeOpen(false)
      addGradeForm.reset()
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail ?? 'Nhập điểm thất bại')
    },
  })

  const bulkGradeMutation = useMutation({
    mutationFn: gradingApi.grades.bulkCreate,
    onSuccess: (res) => {
      if (selectedCS) queryClient.invalidateQueries({ queryKey: ['grading', 'grades', selectedCS.id] })
      toast.success(`Đã nhập ${(res.data as unknown[])?.length ?? 0} điểm`)
      setBulkGradeOpen(false)
      bulkForm.reset()
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail ?? 'Nhập điểm hàng loạt thất bại')
    },
  })

  const updateGradeMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { score: number; reason: string } }) =>
      gradingApi.grades.update(id, payload),
    onSuccess: () => {
      if (selectedCS) queryClient.invalidateQueries({ queryKey: ['grading', 'grades', selectedCS.id] })
      toast.success('Đã sửa điểm')
      setEditGrade(null)
      editGradeForm.reset()
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail ?? 'Sửa điểm thất bại')
    },
  })

  // ── Forms ──────────────────────────────────────────────────────────────────
  const csForm = useForm<ClassSubjectFormValues>({
    resolver: zodResolver(classSubjectSchema),
    defaultValues: { classroom_id: '' as unknown as number, subject_id: '' as unknown as number, teacher_id: '' as unknown as number, semester: 1, academic_year: '' },
  })

  const editCSForm = useForm<ClassSubjectUpdateFormValues>({
    resolver: zodResolver(classSubjectUpdateSchema),
    values: selectedCS ? { teacher_id: selectedCS.teacher_id ?? '' as unknown as number } : undefined,
  })

  const compForm = useForm<GradeComponentFormValues>({
    resolver: zodResolver(gradeComponentSchema),
    defaultValues: { component_name: '', weight_percent: 10, min_count: 1 },
  })

  const editCompForm = useForm<GradeComponentUpdateFormValues>({
    resolver: zodResolver(gradeComponentUpdateSchema),
    values: editComponent ? {
      component_name: editComponent.component_name,
      weight_percent: editComponent.weight_percent,
      min_count: editComponent.min_count,
    } : undefined,
  })

  const addGradeForm = useForm<GradeCreateFormValues>({
    resolver: zodResolver(gradeCreateSchema),
    defaultValues: { student_id: '' as unknown as number, grade_component_id: '' as unknown as number, score: 0 },
  })

  const bulkForm = useForm<GradeBulkFormValues>({
    resolver: zodResolver(gradeBulkSchema),
    defaultValues: { grade_component_id: '' as unknown as number, bulk_input: '', exam_date: '' },
  })

  const editGradeForm = useForm<GradeUpdateFormValues>({
    resolver: zodResolver(gradeUpdateSchema),
    values: editGrade ? { score: editGrade.score, reason: '' } : undefined,
  })

  // Parse bulk input: "student_id:score" per line
  function handleBulkSubmit(v: GradeBulkFormValues) {
    if (!selectedCS) return
    const lines = v.bulk_input.trim().split('\n').filter(Boolean)
    const grades: { student_id: number; score: number }[] = []
    for (const line of lines) {
      const parts = line.split(/[,\t:]+/)
      const student_id = parseInt(parts[0]?.trim())
      const score = parseFloat(parts[1]?.trim())
      if (isNaN(student_id) || isNaN(score)) {
        toast.error(`Dòng không hợp lệ: "${line}"`)
        return
      }
      grades.push({ student_id, score })
    }
    bulkGradeMutation.mutate({
      class_subject_id: selectedCS.id,
      grade_component_id: v.grade_component_id,
      exam_date: v.exam_date || undefined,
      grades,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Input placeholder="Năm học..." className="w-36"
            onChange={(e) => setCsParams(p => ({ ...p, academic_year: e.target.value || undefined }))} />
          <Select onValueChange={(v) => setCsParams(p => ({ ...p, semester: v === 'all' ? undefined : Number(v) as 1 | 2 }))}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Học kỳ" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="1">Học kỳ 1</SelectItem>
              <SelectItem value="2">Học kỳ 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Phân công môn học
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : csData?.items.length === 0 ? (
        <EmptyState title="Chưa có phân công" description="Phân công môn học cho lớp để bắt đầu nhập điểm." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lớp</TableHead>
              <TableHead>Môn học</TableHead>
              <TableHead>Giáo viên</TableHead>
              <TableHead>Học kỳ</TableHead>
              <TableHead>Năm học</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[160px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {csData?.items.map((cs) => (
              <TableRow key={cs.id}>
                <TableCell>
                  <div className="font-medium text-sm">{cs.class_name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{cs.class_code}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm">{cs.subject_name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{cs.subject_code}</div>
                </TableCell>
                <TableCell className="text-sm">{cs.teacher_name ?? '—'}</TableCell>
                <TableCell><Badge variant="outline">HK {cs.semester}</Badge></TableCell>
                <TableCell className="text-sm">{cs.academic_year}</TableCell>
                <TableCell>
                  <Badge variant={cs.is_active ? 'default' : 'secondary'}>
                    {cs.is_active ? 'Đang dạy' : 'Đã kết thúc'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Cập nhật phân công"
                      onClick={() => { setSelectedCS(cs); setEditCSOpen(true) }}>
                      <UserCheck className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Thành phần điểm"
                      onClick={() => { setSelectedCS(cs); setComponentsOpen(true) }}>
                      <Settings2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Bảng điểm"
                      onClick={() => { setSelectedCS(cs); setGradesOpen(true) }}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Thống kê"
                      onClick={() => { setSelectedCS(cs); setStatsOpen(true) }}>
                      <BarChart2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {csData && csData.total_pages > 1 && (
        <TablePagination
          page={csData.page} totalPages={csData.total_pages} total={csData.total}
          pageSize={csData.page_size} onPageChange={(p) => setCsParams(prev => ({ ...prev, page: p }))}
        />
      )}

      {/* ── Create ClassSubject Dialog ── */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) csForm.reset() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Phân công môn học</DialogTitle></DialogHeader>
          <Form {...csForm}>
            <form onSubmit={csForm.handleSubmit((v) => createCSMutation.mutate({
              classroom_id: v.classroom_id,
              subject_id: v.subject_id,
              teacher_id: v.teacher_id || undefined,
              semester: v.semester,
              academic_year: v.academic_year,
            }))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={csForm.control} name="classroom_id" render={({ field }) => (
                  <FormItem><FormLabel>ID Lớp học <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="number" min={1} placeholder="ID lớp" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={csForm.control} name="subject_id" render={({ field }) => (
                  <FormItem><FormLabel>ID Môn học <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="number" min={1} placeholder="ID môn học" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={csForm.control} name="teacher_id" render={({ field }) => (
                  <FormItem><FormLabel>ID Giáo viên</FormLabel>
                    <FormControl><Input type="number" min={1} placeholder="ID giáo viên" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={csForm.control} name="semester" render={({ field }) => (
                  <FormItem><FormLabel>Học kỳ <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Chọn HK" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="1">Học kỳ 1</SelectItem>
                        <SelectItem value="2">Học kỳ 2</SelectItem>
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={csForm.control} name="academic_year" render={({ field }) => (
                  <FormItem className="col-span-2"><FormLabel>Năm học <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="VD: 2024-2025" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>Huỷ</Button>
                <Button type="submit" disabled={createCSMutation.isPending}>
                  {createCSMutation.isPending ? 'Đang lưu...' : 'Phân công'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Update ClassSubject Dialog ── */}
      <Dialog open={editCSOpen} onOpenChange={(o) => !o && setEditCSOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật phân công – {selectedCS?.subject_name} ({selectedCS?.class_name})</DialogTitle>
          </DialogHeader>
          <Form {...editCSForm}>
            <form onSubmit={editCSForm.handleSubmit((v) => selectedCS && updateCSMutation.mutate({
              id: selectedCS.id,
              payload: { teacher_id: v.teacher_id || undefined },
            }))} className="space-y-4">
              <FormField control={editCSForm.control} name="teacher_id" render={({ field }) => (
                <FormItem><FormLabel>ID Giáo viên mới</FormLabel>
                  <FormControl><Input type="number" min={1} placeholder="ID giáo viên" {...field} /></FormControl>
                  <FormMessage /></FormItem>
              )} />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Trạng thái:</span>
                <Button
                  type="button"
                  variant={selectedCS?.is_active ? 'destructive' : 'default'}
                  size="sm"
                  onClick={() => selectedCS && updateCSMutation.mutate({
                    id: selectedCS.id,
                    payload: { is_active: !selectedCS.is_active },
                  })}
                  disabled={updateCSMutation.isPending}
                >
                  {selectedCS?.is_active ? 'Kết thúc môn học' : 'Kích hoạt lại'}
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setEditCSOpen(false)}>Huỷ</Button>
                <Button type="submit" disabled={updateCSMutation.isPending}>
                  {updateCSMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Grade Components Dialog ── */}
      <Dialog open={componentsOpen} onOpenChange={(o) => !o && setComponentsOpen(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thành phần điểm – {selectedCS?.subject_name} ({selectedCS?.class_name})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {loadingComponents ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : components && components.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên thành phần</TableHead>
                    <TableHead>Trọng số (%)</TableHead>
                    <TableHead>Số bài tối thiểu</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {components.map((comp) => (
                    <TableRow key={comp.id}>
                      <TableCell className="font-medium">{comp.component_name}</TableCell>
                      <TableCell>{comp.weight_percent}%</TableCell>
                      <TableCell>{comp.min_count}</TableCell>
                      <TableCell>
                        <Badge variant={comp.is_active ? 'default' : 'secondary'}>
                          {comp.is_active ? 'Đang dùng' : 'Đã dừng'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditComponent(comp)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Chưa có thành phần điểm nào.</p>
            )}

            {/* Weight total */}
            {components && components.length > 0 && (
              <p className="text-xs text-muted-foreground text-right">
                Tổng trọng số: <span className={
                  components.filter(c => c.is_active).reduce((s, c) => s + c.weight_percent, 0) === 100
                    ? 'text-green-600 font-semibold'
                    : 'text-orange-500 font-semibold'
                }>
                  {components.filter(c => c.is_active).reduce((s, c) => s + c.weight_percent, 0)}%
                </span> / 100%
              </p>
            )}

            <Separator />
            <h4 className="text-sm font-semibold">Thêm thành phần điểm</h4>
            <Form {...compForm}>
              <form onSubmit={compForm.handleSubmit((v) => selectedCS && createComponentMutation.mutate({
                class_subject_id: selectedCS.id,
                component_name: v.component_name,
                weight_percent: v.weight_percent,
                min_count: v.min_count,
              }))} className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <FormField control={compForm.control} name="component_name" render={({ field }) => (
                    <FormItem className="col-span-1"><FormLabel>Tên thành phần</FormLabel>
                      <FormControl><Input placeholder="VD: Kiểm tra miệng" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={compForm.control} name="weight_percent" render={({ field }) => (
                    <FormItem><FormLabel>Trọng số (%)</FormLabel>
                      <FormControl><Input type="number" min={1} max={100} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={compForm.control} name="min_count" render={({ field }) => (
                    <FormItem><FormLabel>Số bài tối thiểu</FormLabel>
                      <FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <Button type="submit" size="sm" disabled={createComponentMutation.isPending}>
                  <Plus className="h-4 w-4 mr-1" />
                  {createComponentMutation.isPending ? 'Đang thêm...' : 'Thêm thành phần'}
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Grade Component Dialog ── */}
      <Dialog open={!!editComponent} onOpenChange={(o) => !o && setEditComponent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Sửa thành phần điểm</DialogTitle></DialogHeader>
          <Form {...editCompForm}>
            <form onSubmit={editCompForm.handleSubmit((v) => editComponent && updateComponentMutation.mutate({ id: editComponent.id, payload: v }))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editCompForm.control} name="component_name" render={({ field }) => (
                  <FormItem className="col-span-2"><FormLabel>Tên thành phần</FormLabel>
                    <FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={editCompForm.control} name="weight_percent" render={({ field }) => (
                  <FormItem><FormLabel>Trọng số (%)</FormLabel>
                    <FormControl><Input type="number" min={1} max={100} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={editCompForm.control} name="min_count" render={({ field }) => (
                  <FormItem><FormLabel>Số bài tối thiểu</FormLabel>
                    <FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Trạng thái:</span>
                <Button
                  type="button"
                  variant={editComponent?.is_active ? 'destructive' : 'default'}
                  size="sm"
                  onClick={() => editComponent && updateComponentMutation.mutate({
                    id: editComponent.id,
                    payload: { is_active: !editComponent.is_active },
                  })}
                  disabled={updateComponentMutation.isPending}
                >
                  {editComponent?.is_active ? 'Dừng sử dụng' : 'Kích hoạt'}
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setEditComponent(null)}>Huỷ</Button>
                <Button type="submit" disabled={updateComponentMutation.isPending}>
                  {updateComponentMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Grades Dialog ── */}
      <Dialog open={gradesOpen} onOpenChange={(o) => !o && setGradesOpen(false)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Bảng điểm – {selectedCS?.subject_name} ({selectedCS?.class_name}) – HK{selectedCS?.semester}</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 pb-2">
            <Button size="sm" onClick={() => setAddGradeOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Nhập điểm
            </Button>
            <Button size="sm" variant="outline" onClick={() => setBulkGradeOpen(true)}>
              <Upload className="h-4 w-4 mr-1" /> Nhập hàng loạt
            </Button>
          </div>
          <div className="overflow-y-auto flex-1">
            {loadingGrades ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : gradesData?.items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Chưa có điểm nào.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Học sinh</TableHead>
                    <TableHead>Thành phần</TableHead>
                    <TableHead>Điểm</TableHead>
                    <TableHead>Ngày kiểm tra</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradesData?.items.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{grade.student_name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{grade.student_code}</div>
                      </TableCell>
                      <TableCell className="text-sm">{grade.component_name}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${grade.score >= 8 ? 'text-blue-600' : grade.score >= 5 ? 'text-green-600' : 'text-red-600'}`}>
                          {grade.score}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {grade.exam_date ? new Date(grade.exam_date).toLocaleDateString('vi-VN') : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Sửa điểm"
                            onClick={() => { setEditGrade(grade) }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Lịch sử thay đổi"
                            onClick={() => setAuditGrade(grade)}>
                            <History className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Add Grade Dialog ── */}
      <Dialog open={addGradeOpen} onOpenChange={(o) => { setAddGradeOpen(o); if (!o) addGradeForm.reset() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nhập điểm – {selectedCS?.subject_name} ({selectedCS?.class_name})</DialogTitle>
          </DialogHeader>
          <Form {...addGradeForm}>
            <form onSubmit={addGradeForm.handleSubmit((v) => selectedCS && createGradeMutation.mutate({
              student_id: v.student_id,
              class_subject_id: selectedCS.id,
              grade_component_id: v.grade_component_id,
              score: v.score,
              exam_date: v.exam_date || undefined,
            }))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={addGradeForm.control} name="student_id" render={({ field }) => (
                  <FormItem><FormLabel>ID Học sinh <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="number" min={1} placeholder="ID học sinh" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={addGradeForm.control} name="grade_component_id" render={({ field }) => (
                  <FormItem><FormLabel>Thành phần điểm <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Chọn thành phần" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {components?.filter(c => c.is_active).map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.component_name} ({c.weight_percent}%)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={addGradeForm.control} name="score" render={({ field }) => (
                  <FormItem><FormLabel>Điểm <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="number" min={0} max={10} step={0.1} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={addGradeForm.control} name="exam_date" render={({ field }) => (
                  <FormItem><FormLabel>Ngày kiểm tra</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setAddGradeOpen(false)}>Huỷ</Button>
                <Button type="submit" disabled={createGradeMutation.isPending}>
                  {createGradeMutation.isPending ? 'Đang lưu...' : 'Nhập điểm'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Grade Dialog ── */}
      <Dialog open={bulkGradeOpen} onOpenChange={(o) => { setBulkGradeOpen(o); if (!o) bulkForm.reset() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nhập điểm hàng loạt – {selectedCS?.subject_name}</DialogTitle>
          </DialogHeader>
          <Form {...bulkForm}>
            <form onSubmit={bulkForm.handleSubmit(handleBulkSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={bulkForm.control} name="grade_component_id" render={({ field }) => (
                  <FormItem><FormLabel>Thành phần điểm <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Chọn thành phần" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {components?.filter(c => c.is_active).map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.component_name} ({c.weight_percent}%)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={bulkForm.control} name="exam_date" render={({ field }) => (
                  <FormItem><FormLabel>Ngày kiểm tra</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={bulkForm.control} name="bulk_input" render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh sách điểm <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full min-h-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                      placeholder={"Mỗi dòng: student_id,điểm\nVD:\n1,8.5\n2,7.0\n3,9.5"}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Định dạng mỗi dòng: <code>student_id,điểm</code> (dùng dấu phẩy hoặc tab)</p>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setBulkGradeOpen(false)}>Huỷ</Button>
                <Button type="submit" disabled={bulkGradeMutation.isPending}>
                  {bulkGradeMutation.isPending ? 'Đang nhập...' : 'Nhập hàng loạt'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Grade Dialog ── */}
      <Dialog open={!!editGrade} onOpenChange={(o) => { if (!o) { setEditGrade(null); editGradeForm.reset() } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa điểm – {editGrade?.student_name}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mb-2">
            <span>Thành phần: <strong>{editGrade?.component_name}</strong></span>
            {' · '}
            <span>Điểm hiện tại: <strong className="text-foreground">{editGrade?.score}</strong></span>
          </div>
          <Form {...editGradeForm}>
            <form onSubmit={editGradeForm.handleSubmit((v) => editGrade && updateGradeMutation.mutate({
              id: editGrade.id,
              payload: { score: v.score, reason: v.reason },
            }))} className="space-y-4">
              <FormField control={editGradeForm.control} name="score" render={({ field }) => (
                <FormItem><FormLabel>Điểm mới <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input type="number" min={0} max={10} step={0.1} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editGradeForm.control} name="reason" render={({ field }) => (
                <FormItem><FormLabel>Lý do sửa điểm <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="VD: Chấm sai, đã phúc tra lại..."
                      {...field}
                    />
                  </FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setEditGrade(null)}>Huỷ</Button>
                <Button type="submit" disabled={updateGradeMutation.isPending}>
                  {updateGradeMutation.isPending ? 'Đang lưu...' : 'Lưu điểm mới'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Audit Log Dialog ── */}
      <Dialog open={!!auditGrade} onOpenChange={(o) => !o && setAuditGrade(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lịch sử thay đổi điểm – {auditGrade?.student_name}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mb-3">
            Thành phần: <strong>{auditGrade?.component_name}</strong>
            {' · '}
            Điểm hiện tại: <strong className="text-foreground">{auditGrade?.score}</strong>
          </div>
          {loadingAudit ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : auditLogs && auditLogs.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="rounded-md border p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="text-muted-foreground line-through">{log.old_score}</span>
                      {' → '}
                      <span className="font-semibold">{log.new_score}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs italic">"{log.reason}"</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">Chưa có lịch sử thay đổi điểm.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Statistics Dialog ── */}
      <Dialog open={statsOpen} onOpenChange={(o) => !o && setStatsOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thống kê điểm – {selectedCS?.subject_name} ({selectedCS?.class_name})</DialogTitle>
          </DialogHeader>
          {stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Tổng học sinh', value: stats.total_students },
                  { label: 'Điểm trung bình', value: stats.avg_score?.toFixed(2) ?? '—' },
                  { label: 'Điểm cao nhất', value: stats.max_score ?? '—' },
                  { label: 'Điểm thấp nhất', value: stats.min_score ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border p-3 text-center">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div>
                <p className="text-sm font-semibold mb-2">Phân loại học lực</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(stats.rank_distribution).map(([rank, count]) => (
                    <div key={rank} className={`flex items-center justify-between rounded-md px-3 py-2 ${ACADEMIC_RANK_COLOR[rank as keyof typeof ACADEMIC_RANK_COLOR]}`}>
                      <span className="text-sm font-medium">{ACADEMIC_RANK_LABEL[rank as keyof typeof ACADEMIC_RANK_LABEL]}</span>
                      <span className="font-bold">{count} HS</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">Không có dữ liệu thống kê.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Main GradingPage ──────────────────────────────────────────────────────────
export function GradingPage() {
  return (
    <div>
      <PageHeader
        title="Quản lý Điểm số"
        description="Quản lý môn học, phân công giảng dạy và nhập điểm"
      />

      <Tabs defaultValue="subjects">
        <TabsList className="mb-4">
          <TabsTrigger value="subjects" className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" /> Môn học
          </TabsTrigger>
          <TabsTrigger value="classSubjects" className="flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4" /> Phân công & Điểm số
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="pt-4">
            <TabsContent value="subjects" className="mt-0">
              <SubjectTab />
            </TabsContent>
            <TabsContent value="classSubjects" className="mt-0">
              <ClassSubjectTab />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
