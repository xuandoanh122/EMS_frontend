Cấu trúc d:/EMS_frontend/ — 51 files
Để chạy, bạn cần:

cd d:/EMS_frontend
npm install
cp .env.example .env   # sửa VITE_API_BASE_URL nếu backend chạy port khác
npm run dev            # → http://localhost:3000
Những gì đã có (kết nối API thật):
Module	Tính năng
Dashboard	Thống kê tổng số HS/GV, danh sách mới nhất, gọi 4 API song song
Học sinh	CRUD đầy đủ, filter search + trạng thái, phân trang, audit status transition
Giáo viên	CRUD đầy đủ, filter search + trạng thái, phân trang, audit status transition
Lớp học / Điểm / Lương	Placeholder — sẵn sàng kết nối khi API xây dựng xong
Architecture highlights:
src/api/ — Axios client với interceptors (401 auto redirect, toast lỗi)
src/features/{module}/hooks/ — TanStack Query: auto cache, invalidate, loading states
src/features/{module}/schemas/ — Zod validation cho tất cả forms
src/stores/auth.store.ts — Zustand với persist (sẵn sàng khi auth API xong)
Status transitions — enforce đúng theo logic backend (VD: graduated → không thể chuyển)
Khi bạn xây xong API tiếp theo (classrooms, grading, salary...), hãy báo tôi và tôi sẽ kết nối UI ngay!