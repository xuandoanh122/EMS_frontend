# Quy trình Debug EMS Frontend

## 1. Trạng thái hiện tại

### Task hiện tại: Hoàn thành tính năng cấp tài khoản Giáo viên

#### Các file đã tạo:
- `src/pages/ChangePasswordPage.tsx` - Trang đổi mật khẩu bắt buộc
- `src/pages/ForgotPasswordPage.tsx` - Trang quên mật khẩu
- `src/pages/ResetPasswordPage.tsx` - Trang reset mật khẩu
- `src/features/teachers/components/TeacherAccountDialog.tsx` - Dialog quản lý tài khoản

#### Các file đã sửa:
- `src/api/auth.api.ts` - Thêm các API endpoints mới
- `src/stores/auth.store.ts` - Thêm xử lý must_change_password
- `src/pages/LoginPage.tsx` - Thêm link quên mật khẩu, redirect khi first login
- `src/App.tsx` - Thêm routes mới
- `src/types/teacher.types.ts` - Thêm fields cho account info
- `src/features/teachers/components/TeacherTable.tsx` - Thêm cột Tài khoản
- `src/pages/TeachersPage.tsx` - Thêm dialog quản lý tài khoản

#### Vấn đề đã biết:
1. Lỗi 422: Backend expect teacher_id trong body thay vì path parameter
2. Lỗi 401: Cần xác minh token có được gửi đúng không

## 2. Quy trình Debug Frontend

### Bước 1: Xác định lỗi Frontend hay Backend?
- Frontend: Syntax, TypeScript, React, UI, State
- Backend: API errors (401, 403, 404, 422, 500)

### Bước 2: Kiểm tra API
- Đọc API.md để hiểu contract
- Check URL, method, headers, body

### Bước 3: Kiểm tra Authentication
- Token có trong localStorage?
- apiClient được dùng chưa?
- Interceptor thêm token?

### Bước 4: Kiểm tra Console
- Mở F12 > Console để xem lỗi

---

## 3. Các Terminal Scripts

### Chạy Frontend:
```bash
cd d:/EMS_frontend
npm install
npm run dev
```

### Build:
```bash
cd d:/EMS_frontend
npm run build
```

---

## 4. Authentication Flow

```
1. Login → Lưu token vào localStorage
2. apiClient interceptor → Tự động gắn Bearer token
3. Khi 401 → Redirect về /login
```

### Các file liên quan:
- `src/api/client.ts` - Interceptor thêm token
- `src/api/auth.api.ts` - Auth APIs
- `src/stores/auth.store.ts` - Auth state
- `src/pages/LoginPage.tsx` - Login page

---

## 5. Checklist Debug

### Khi gặp lỗi API:
- [ ] Endpoint đúng?
- [ ] Method đúng?
- [ ] Cần auth? → Dùng apiClient

### Khi gặp lỗi UI:
- [ ] Import đúng?
- [ ] Props đúng?
- [ ] State cập nhật?

---

## 6. Lưu ý quan trọng

1. **FRONTEND ONLY** - Không sửa backend
2. **Đọc debug_state.md** trước khi làm
3. **Phân biệt lỗi** Frontend vs Backend
4. **Báo user** khi xác định lỗi từ backend

---

## 7. Các lỗi đã gặp

### Lỗi 422 - Validation Error
**Nguyên nhân**: Backend expect teacher_id trong body
**Giải pháp**: Báo user fix backend

### Lỗi 401 - Unauthorized
**Nguyên nhân**: Có thể do token không hợp lệ hoặc backend
**Giải pháp**: Kiểm tra console, báo user check backend
