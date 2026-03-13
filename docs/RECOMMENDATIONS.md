# EMS Frontend - Recommendations

## 📋 Tổng kết các file đã tạo

### Animation Components
- `src/components/animations/FadeIn.tsx` - Fade in animation với hướng
- `src/components/animations/StaggerChildren.tsx` - Stagger animation cho lists
- `src/components/animations/ScaleIn.tsx` - Scale và Slide animations
- `src/components/animations/PageTransition.tsx` - Page transition
- `src/components/animations/index.ts` - Export all animations

### Workflow Patterns
- `src/hooks/useWorkflow.ts` - Hook cho multi-step workflows
- `src/hooks/useCrudWorkflow.ts` - Hook cho CRUD operations với dialog management
- `src/hooks/index.ts` - Export all hooks

### UI Infrastructure
- `src/stores/ui.store.ts` - Zustand store cho UI state (breadcrumbs, sidebar, etc.)
- `src/components/layout/Breadcrumbs.tsx` - Breadcrumb navigation
- `src/components/shared/Stepper.tsx` - Stepper cho multi-step forms

---

## 🎯 Hướng dẫn sử dụng

### 1. Animation

```tsx
import { FadeIn, StaggerChildren, StaggerItem, PageTransition } from '@/components/animations'

// Page transition
function StudentsPage() {
  return (
    <PageTransition>
      <h1>Danh sách học sinh</h1>
    </PageTransition>
  )
}

// Fade in với direction
function Card() {
  return (
    <FadeIn direction="up" delay={0.1}>
      <div>Nội dung</div>
    </FadeIn>
  )
}

// List với stagger
function StudentList({ students }) {
  return (
    <StaggerChildren stagger={0.05}>
      {students.map(s => (
        <StaggerItem key={s.id}>
          <StudentCard student={s} />
        </StaggerItem>
      ))}
    </StaggerChildren>
  )
}
```

### 2. Workflow

```tsx
import { useWorkflow } from '@/hooks'

function CreateStudentWizard() {
  const workflow = useWorkflow({
    steps: [
      { id: 'basic', title: 'Thông tin cơ bản' },
      { id: 'contact', title: 'Liên hệ' },
      { id: 'review', title: 'Xác nhận' },
    ],
    onComplete: (data) => submitStudent(data),
  })

  return (
    <div>
      <Stepper 
        steps={workflow.steps.map(s => s.title)} 
        currentStep={workflow.currentStep}
      />
      
      {workflow.currentStep === 0 && (
        <BasicInfoForm 
          data={workflow.data} 
          onChange={workflow.setData} 
        />
      )}
      
      <Button onClick={workflow.nextStep}>
        {workflow.isLastStep ? 'Hoàn thành' : 'Tiếp theo'}
      </Button>
    </div>
  )
}
```

### 3. CRUD Workflow

```tsx
import { useCrudWorkflow } from '@/hooks'

function StudentsPage() {
  const crud = useCrudWorkflow({
    queryKey: studentKeys.lists(),
    mutationFn: studentsApi.create,
    onSuccess: (res) => `Đã tạo ${res.data.full_name}`,
    invalidateQueries: [studentKeys.lists()],
  })

  return (
    <div>
      <Button onClick={crud.openCreate}>Thêm học sinh</Button>
      
      <Dialog open={crud.isOpen} onOpenChange={crud.closeDialog}>
        <StudentForm 
          mode={crud.mode}
          data={crud.data}
          onSubmit={crud.execute}
          isLoading={crud.isPending}
        />
      </Dialog>
    </div>
  )
}
```

### 4. Breadcrumbs

```tsx
import { useUIStore } from '@/stores/ui.store'

function StudentDetailPage() {
  const setBreadcrumbs = useUIStore(s => s.setBreadcrumbs)
  
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Học sinh', href: '/students' },
      { label: 'Chi tiết' },
    ])
    return () => setBreadcrumbs([])
  }, [])
  
  return <div>Nội dung...</div>
}
```

---

## 🔧 Bước tiếp theo cần làm

### Bắt buộc (để chạy được)
```bash
npm install framer-motion
```

### Nâng cao thêm
1. **Page transitions**: Sử dụng `AnimatePresence` từ framer-motion trong router
2. **Skeleton loaders**: Tạo skeleton components cho từng loại dữ liệu
3. **Drag and drop**: Thư viện `@dnd-kit/core` cho tính năng kéo thả
4. **Virtual scrolling**: `@tanstack/react-virtual` cho danh sách lớn

---

## 📁 Cấu trúc file khuyến nghị

```
src/
├── app/
│   ├── query-client.ts
│   └── router.tsx
├── components/
│   ├── animations/        # ✅ Đã tạo
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── TopNav.tsx
│   │   └── Breadcrumbs.tsx  # ✅ Đã tạo
│   └── shared/
│       ├── Stepper.tsx      # ✅ Đã tạo
│       └── DataTable.tsx    # Nên tạo
├── features/
│   └── {module}/
│       ├── components/
│       ├── hooks/
│       ├── schemas/
│       └── workflows/       # Nên tách workflow riêng
├── hooks/                  # ✅ Đã tạo
│   ├── useWorkflow.ts
│   ├── useCrudWorkflow.ts
│   └── index.ts
├── lib/
│   ├── animations.ts       # Animation configs
│   └── utils.ts
├── stores/
│   ├── auth.store.ts
│   └── ui.store.ts         # ✅ Đã tạo
└── types/
```
