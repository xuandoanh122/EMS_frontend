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
  ChevronRight,
  Eye,
  Pencil,
  Settings2,
} from 'lucide-react'
import { gradingApi } from '@/api/grading.api'
import type {
  Subject,
  ClassSubject,
  GradeComponent,
  SubjectQueryParams,
  ClassSubjectQueryParams,
  ACADEMIC_RANK_COLOR,
} from '@/types/grading.types'
import { SUBJECT_TYPE_LABEL, ACADEMIC_RANK_LABEL } from '@/types/grading.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const gradeComponentSchema = z.object({
  component_name: z.string().min(1, 'Tên thành phần là bắt buộc').max(100),
  weight_percent: z.coerce.number().int().min(1).max(100),
  min_count: z.coerce.number().int().min(1).optional(),
})

const gradeUpdateSchema = z.object({
  score: z.coerce.number().min(0).max(10),
  reason: z.string().min(1, 'Lý do sửa điểm là bắt buộc').max(300),
})

type SubjectFormValues = z.infer<typeof subjectSchema>
type ClassSubjectFormValues = z.infer<typeof classSubjectSchema>
type GradeComponentFormValues = z.infer<typeof gradeComponentSchema>
type GradeUpdateFormValues = z.infer<typeof gradeUpdateSchema>

// ── Hooks ─────────────────────────────────────────────────────────────────────
const gradingKeys = {
  subjects: (p: SubjectQueryParams) => ['grading', 'subjects', p] as const,
  classSubjects: (p: ClassSubjectQueryParams) => ['grading', 'class-subjects', p] as const,
  components: (cs_id: number) => ['grading', 'grade-components', cs_id] as const,
  grades: (cs_id: number, p: object) => ['grading', 'grades', cs_id, p] as const,
  statistics: (cs_id: number) => ['grading', 'statistics', cs_id] as const,
}

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

  const editForm = useForm<SubjectFormValues>({
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
        <div className="flex items-center gap-2">
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
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
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
  const queryClient = useQueryClient()

  const { data: csData, isLoading } = useClassSubjects(csParams)
  const { data: components, isLoading: loadingComponents } = useGradeComponents(selectedCS?.id ?? 0)
  const { data: gradesData, isLoading: loadingGrades } = useClassSubjectGrades(selectedCS?.id ?? 0)
  const { data: stats } = useClassSubjectStatistics(selectedCS?.id ?? 0)

  const createCSMutation = useMutation({
    mutationFn: gradingApi.classSubjects.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'class-subjects'] })
      toast.success('Đã phân công môn học')
      setCreateOpen(false)
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail ?? 'Phân công thất bại')
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

  const csForm = useForm<ClassSubjectFormValues>({
    resolver: zodResolver(classSubjectSchema),
    defaultValues: { classroom_id: '' as unknown as number, subject_id: '' as unknown as number, teacher_id: '' as unknown as number, semester: 1, academic_year: '' },
  })

  const compForm = useForm<GradeComponentFormValues>({
    resolver: zodResolver(gradeComponentSchema),
    defaultValues: { component_name: '', weight_percent: 10, min_count: 1 },
  })

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
              <TableHead className="w-[120px]"></TableHead>
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
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Thành phần điểm"
                      onClick={() => { setSelectedCS(cs); setComponentsOpen(true) }}>
                      <Settings2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Xem điểm"
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

      {/* Create ClassSubject Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
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

      {/* Grade Components Dialog */}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Chưa có thành phần điểm nào.</p>
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

      {/* Grades Dialog */}
      <Dialog open={gradesOpen} onOpenChange={(o) => !o && setGradesOpen(false)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bảng điểm – {selectedCS?.subject_name} ({selectedCS?.class_name}) – HK{selectedCS?.semester}</DialogTitle>
          </DialogHeader>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Statistics Dialog */}
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
                    <div key={rank} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <span className="text-sm">{ACADEMIC_RANK_LABEL[rank as keyof typeof ACADEMIC_RANK_LABEL]}</span>
                      <Badge variant="secondary">{count} HS</Badge>
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
