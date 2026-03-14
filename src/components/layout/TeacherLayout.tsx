import { Outlet } from 'react-router-dom'
import { TeacherTopNav } from './TeacherTopNav'

export function TeacherLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherTopNav />
      <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
