import { useMemo, useState, type KeyboardEvent } from 'react'
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Clock,
  GraduationCap,
  ListChecks,
  Users,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AttendanceStatus,
  GradeScale,
  countAbsences,
  computeAverage,
  getEvaluationLabel,
  maxScoreByScale,
  nextAttendanceStatus,
  roundByScale,
  shouldHighlightAbsence,
} from '@/lib/teacher-portal'

type ScoreKey = 'listening' | 'speaking' | 'reading' | 'writing'

const SCORE_KEYS: ScoreKey[] = ['listening', 'speaking', 'reading', 'writing']
const SCORE_LABELS: Record<ScoreKey, string> = {
  listening: 'Nghe',
  speaking: 'Nói',
  reading: 'Đọc',
  writing: 'Viết',
}

const CLASS_OPTIONS: { id: string; name: string; scale: GradeScale; subject: string }[] = [
  { id: 'ielts-7a', name: 'IELTS 7.0 - Lớp A', scale: 'ielts', subject: 'IELTS' },
  { id: 'basic-10a1', name: 'Cơ bản 10A1', scale: 'standard', subject: 'Tiếng Anh' },
]

const STUDENTS = [
  { id: 1, code: 'HS001', name: 'Nguyễn Minh An' },
  { id: 2, code: 'HS002', name: 'Trần Phương Linh' },
  { id: 3, code: 'HS003', name: 'Lê Quốc Bảo' },
  { id: 4, code: 'HS004', name: 'Phạm Thảo Nhi' },
  { id: 5, code: 'HS005', name: 'Đỗ Gia Huy' },
]

const ATTENDANCE_STYLES: Record<AttendanceStatus, string> = {
  none: 'bg-white text-muted-foreground',
  present: 'bg-emerald-100 text-emerald-700',
  absent_unexcused: 'bg-rose-100 text-rose-700',
  absent_excused: 'bg-amber-100 text-amber-700',
}

const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  none: 'Trống',
  present: 'Có mặt',
  absent_unexcused: 'Vắng không phép',
  absent_excused: 'Vắng có phép',
}

const WEEK_DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

const TIMETABLE_EVENTS = [
  { id: 'e1', dayIndex: 1, title: 'IELTS 7.0', time: '18:00 - 20:00', room: 'P.402', type: 'ielts' },
  { id: 'e2', dayIndex: 3, title: 'Giao tiếp A2', time: '19:00 - 20:30', room: 'P.208', type: 'comm' },
  { id: 'e3', dayIndex: 5, title: 'IELTS 6.0', time: '17:00 - 19:00', room: 'P.305', type: 'ielts' },
]

const EVENT_COLORS: Record<string, string> = {
  ielts: 'bg-blue-100 text-blue-700 border-blue-200',
  comm: 'bg-orange-100 text-orange-700 border-orange-200',
}

type GradeRow = {
  id: number
  code: string
  name: string
  scores: Record<ScoreKey, string>
}

export function TeacherPortalPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedClassId, setSelectedClassId] = useState(CLASS_OPTIONS[0].id)
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week')

  const [gradeRows, setGradeRows] = useState<GradeRow[]>(
    STUDENTS.map((student) => ({
      ...student,
      scores: {
        listening: '',
        speaking: '',
        reading: '',
        writing: '',
      },
    })),
  )

  const selectedClass = CLASS_OPTIONS.find((item) => item.id === selectedClassId) ?? CLASS_OPTIONS[0]
  const maxScore = maxScoreByScale(selectedClass.scale)

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }),
    [],
  )

  const attendanceSessions = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      return {
        id: date.toISOString().slice(0, 10),
        label: dateFormatter.format(date),
      }
    })
  }, [dateFormatter])

  const [attendance, setAttendance] = useState<Record<number, Record<string, AttendanceStatus>>>({})

  const handleScoreChange = (rowId: number, key: ScoreKey, value: string) => {
    const nextValue = value.replace(/[^\d.]/g, '')
    setGradeRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, scores: { ...row.scores, [key]: nextValue } } : row,
      ),
    )
  }

  const focusCell = (rowIndex: number, colIndex: number) => {
    const target = document.querySelector<HTMLInputElement>(`[data-cell="${rowIndex}-${colIndex}"]`)
    if (target) {
      target.focus()
      target.select()
    }
  }

  const handleCellKeyDown = (event: KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    const totalRows = gradeRows.length
    const totalCols = SCORE_KEYS.length
    let nextRow = rowIndex
    let nextCol = colIndex

    if (event.key === 'Enter' || event.key === 'ArrowDown') {
      nextRow = Math.min(rowIndex + 1, totalRows - 1)
    } else if (event.key === 'ArrowUp') {
      nextRow = Math.max(rowIndex - 1, 0)
    } else if (event.key === 'ArrowLeft') {
      nextCol = Math.max(colIndex - 1, 0)
    } else if (event.key === 'ArrowRight') {
      nextCol = Math.min(colIndex + 1, totalCols - 1)
    } else {
      return
    }

    event.preventDefault()
    focusCell(nextRow, nextCol)
  }

  const getAttendanceStatus = (studentId: number, sessionId: string) =>
    attendance[studentId]?.[sessionId] ?? 'none'

  const handleToggleAttendance = (studentId: number, sessionId: string) => {
    setAttendance((prev) => {
      const current = prev[studentId]?.[sessionId] ?? 'none'
      const next = nextAttendanceStatus(current)
      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [sessionId]: next,
        },
      }
    })
  }

  return (
    <div>
      <PageHeader
        title="Cổng Giáo Viên"
        description="Bảng điều khiển giảng dạy, điểm danh và nhập điểm theo luồng làm việc nhanh."
        actions={
          <Badge variant="outline" className="text-xs">
            GMT+7
          </Badge>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" /> Tổng quan
          </TabsTrigger>
          <TabsTrigger value="gradebook" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Bảng điểm
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" /> Điểm danh
          </TabsTrigger>
          <TabsTrigger value="timetable" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Lịch dạy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Lớp đang phụ trách', value: '4 lớp', icon: Users },
              { label: 'Buổi dạy hôm nay', value: '2 buổi', icon: Clock },
              { label: 'Bài kiểm tra cần nhập', value: '12 mục', icon: GraduationCap },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Lịch dạy hôm nay</CardTitle>
                <p className="text-sm text-muted-foreground">Ưu tiên buổi gần nhất để thao tác nhanh</p>
              </div>
              <Button className="animate-pulse">Điểm danh ngay</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {TIMETABLE_EVENTS.map((event) => (
                <div key={event.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {WEEK_DAYS[event.dayIndex]} · {event.time} · {event.room}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Vào điểm danh</Button>
                    <Button size="sm">Nhập điểm</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gradebook" className="space-y-4">
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle>Bảng điểm dạng Grid</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="secondary">{selectedClass.subject}</Badge>
                <Badge variant="outline">Scale tối đa: {maxScore}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Học sinh</TableHead>
                      {SCORE_KEYS.map((key) => (
                        <TableHead key={key} className="min-w-[120px] text-center">
                          {SCORE_LABELS[key]}
                        </TableHead>
                      ))}
                      <TableHead className="min-w-[120px] text-center">Trung bình</TableHead>
                      <TableHead className="min-w-[120px] text-center">Đánh giá</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradeRows.map((row, rowIndex) => {
                      const scoreNumbers = SCORE_KEYS.map((key) => {
                        const raw = row.scores[key]
                        if (!raw) return null
                        const parsed = Number(raw)
                        if (!Number.isFinite(parsed) || parsed < 0 || parsed > maxScore) return null
                        return parsed
                      })
                      const average = computeAverage(scoreNumbers)
                      const roundedAvg = average === null ? null : roundByScale(average, selectedClass.scale)
                      return (
                        <TableRow key={row.id}>
                          <TableCell>
                            <div className="font-medium">{row.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{row.code}</div>
                          </TableCell>
                          {SCORE_KEYS.map((key, colIndex) => {
                            const raw = row.scores[key]
                            const parsed = raw === '' ? null : Number(raw)
                            const invalid = raw !== '' && (!Number.isFinite(parsed) || parsed < 0 || parsed > maxScore)
                            return (
                              <TableCell key={key} className="text-center">
                                <Input
                                  data-cell={`${rowIndex}-${colIndex}`}
                                  value={row.scores[key]}
                                  onChange={(event) => handleScoreChange(row.id, key, event.target.value)}
                                  onKeyDown={(event) => handleCellKeyDown(event, rowIndex, colIndex)}
                                  className={`h-9 text-center ${invalid ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                                  inputMode="decimal"
                                  placeholder="0.0"
                                />
                              </TableCell>
                            )
                          })}
                          <TableCell className="text-center text-sm font-semibold text-muted-foreground">
                            {roundedAvg === null ? '—' : roundedAvg.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{getEvaluationLabel(roundedAvg)}</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>Điều hướng: Arrow keys để di chuyển, Enter để xuống dòng.</span>
                <span>Ô trung bình/đánh giá khóa nhập tay.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle>Ma trận điểm danh</CardTitle>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(ATTENDANCE_LABELS).map(([key, label]) => (
                  <span key={key} className={`rounded-full px-3 py-1 border ${ATTENDANCE_STYLES[key as AttendanceStatus]}`}>
                    {label}
                  </span>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-white z-10 min-w-[200px]">Học sinh</TableHead>
                      {attendanceSessions.map((session) => (
                        <TableHead key={session.id} className="text-center min-w-[90px]">
                          {session.label}
                        </TableHead>
                      ))}
                      <TableHead className="text-center min-w-[120px]">Vắng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {STUDENTS.map((student) => {
                      const statuses = attendanceSessions.map((session) => getAttendanceStatus(student.id, session.id))
                      const absences = countAbsences(statuses)
                      const highlight = shouldHighlightAbsence(absences, attendanceSessions.length)
                      return (
                        <TableRow key={student.id} className={highlight ? 'bg-amber-50' : ''}>
                          <TableCell className="sticky left-0 bg-white z-10">
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{student.code}</div>
                          </TableCell>
                          {attendanceSessions.map((session) => {
                            const status = getAttendanceStatus(student.id, session.id)
                            return (
                              <TableCell key={session.id} className="text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleAttendance(student.id, session.id)}
                                  className={`w-10 h-10 rounded-md border text-xs font-semibold ${ATTENDANCE_STYLES[status]}`}
                                  title={ATTENDANCE_LABELS[status]}
                                >
                                  {status === 'none' ? '•' : status === 'present' ? 'P' : status === 'absent_unexcused' ? 'A' : 'E'}
                                </button>
                              </TableCell>
                            )
                          })}
                          <TableCell className="text-center font-semibold">
                            {absences}/{attendanceSessions.length}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Học sinh vắng &gt; 20% số buổi sẽ được tô vàng để nhắc giáo viên.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetable" className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Lịch giảng dạy</CardTitle>
              <Select value={calendarView} onValueChange={(value) => setCalendarView(value as 'week' | 'month')}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Xem theo tuần</SelectItem>
                  <SelectItem value="month">Xem theo tháng</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="space-y-4">
              {calendarView === 'week' ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {WEEK_DAYS.map((day, index) => {
                    const events = TIMETABLE_EVENTS.filter((event) => event.dayIndex === index)
                    return (
                      <div key={day} className="rounded-lg border p-3 space-y-2">
                        <p className="font-semibold text-sm">{day}</p>
                        {events.length === 0 && (
                          <p className="text-xs text-muted-foreground">Không có lịch dạy.</p>
                        )}
                        {events.map((event) => (
                          <div key={event.id} className={`rounded-md border p-2 ${EVENT_COLORS[event.type]}`}>
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-sm">{event.title}</p>
                              <Badge variant="outline" className="bg-white/70 text-xs">Lớp</Badge>
                            </div>
                            <p className="text-xs">{event.time} · {event.room}</p>
                            <div className="mt-2 flex gap-2">
                              <Button size="sm" variant="outline">Điểm danh</Button>
                              <Button size="sm">Nhập điểm</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2 text-center">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                    <div key={day} className="rounded-md border p-2 text-xs">
                      <p className="font-semibold">{day}</p>
                      {day % 7 === 2 && (
                        <div className="mt-2 rounded bg-blue-100 text-blue-700 px-1">IELTS</div>
                      )}
                      {day % 7 === 5 && (
                        <div className="mt-2 rounded bg-orange-100 text-orange-700 px-1">Giao tiếp</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
