# EMS Frontend - Improvement Plan

## 1. Current State Analysis

### ✅ Strengths
- Clean folder structure with feature-based organization
- TanStack Query for server state management
- Zustand for client state
- Zod for validation
- shadcn/ui components
- TypeScript throughout

### ❌ Weaknesses
- No animation/transitions
- No workflow orchestration
- UI logic mixed with presentation
- Limited reusability patterns

---

## 2. Improvement Plan

### Phase 1: Animation Foundation (Priority: HIGH)
- Install `framer-motion`
- Create animation utilities
- Add page transitions
- Add micro-interactions

### Phase 2: Workflow Abstraction (Priority: HIGH)
- Create `useWorkflow` hook pattern
- Create orchestration layer for complex flows
- Abstract CRUD operations into reusable patterns

### Phase 3: Scalability Patterns (Priority: MEDIUM)
- Enhance API client with interceptors
- Create shared hooks library
- Add breadcrumb system
- Add notification system

---

## 3. File Structure Recommendations

```
src/
├── app/                    # App-level configurations
│   ├── query-client.ts    # TanStack Query config
│   └── router.tsx         # React Router with transitions
├── components/
│   ├── animation/         # Animation wrappers
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── TopNav.tsx
│   │   └── Breadcrumbs.tsx  # NEW
│   ├── shared/
│   │   ├── PageHeader.tsx   # Enhanced with breadcrumbs
│   │   ├── DataTable.tsx    # NEW - reusable table
│   │   └── EmptyState.tsx
│   └── ui/
├── features/
│   ├── {module}/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── workflows/        # NEW - workflow definitions
│   └── shared/              # Cross-feature utilities
├── hooks/                    # NEW - shared hooks
│   ├── useWorkflow.ts       # Workflow orchestration
│   ├── useTransition.ts     # Page transitions
│   └── useDebounce.ts
├── lib/
│   ├── animations.ts        # Animation configs
│   └── utils.ts
├── stores/
│   ├── auth.store.ts
│   └── ui.store.ts         # NEW - UI state (sidebar, modals)
└── types/
```

---

## 4. Implementation Priority

### P0 - Must Have
1. Framer Motion installation
2. Page transition component
3. Animation wrapper components

### P1 - Should Have
4. Workflow abstraction
5. Breadcrumbs component
6. Enhanced loading states

### P2 - Nice to Have
7. Drag-and-drop reordering
8. Advanced transitions
9. Gesture support
