# EMS Frontend - Agent Working Rules

## PHẦN 1: NGUYÊN TẮC VÀNG (Core Rules)

### Rule 1: KHÔNG BAO GIỜ SỬA BACKEND
- TUYỆT ĐỐI KHÔNG chỉnh sửa code trong thư mục `EMS_backend`
- Nếu gặp vấn đề về API/Business Logic → Báo cho user biết vấn đề nằm ở Backend
- Chỉ tập trung vào Frontend: UI, UX, API calling, State management, Routing

### Rule 2: ĐỌC DEBUG_STATE TRƯỚC KHI LÀM GÌ
- Trước mỗi action → Đọc `agent_rules/debug_state.md`
- File này là source of truth cho context hiện tại
- Tránh重复 (repeat) các command đã chạy

### Rule 3: CẬP NHẬT STATE SAU MỖI BƯỚC
- Sau mỗi bước debug quan trọng → Cập nhật `debug_state.md`
- Ghi lại: đã làm gì, kết quả thế nào, bước tiếp theo là gì

---

## PHẦN 2: QUY TRÌNH CHUẨN (Standard Workflow)

### Khi user báo lỗi hoặc giao task mới:

```
STEP 1: SYNC → Đọc debug_state.md để hiểu context
STEP 2: ANALYZE → Xác định vấn đề (Frontend hay Backend?)
STEP 3: PLAN → Lên kế hoạch 1-3 bước cụ thể
STEP 4: EXECUTE → Thực thi (đọc file, viết code, test)
STEP 5: UPDATE → Cập nhật debug_state.md
STEP 6: COMPLETE → Dùng attempt_completion
```

---

## PHẦN 3: PHÂN TÍCH LỖI - FRONTEND HAY BACKEND?

### 3.1. Dấu hiệu lỗi từ FRONTEND:
| Error Type | Nguyên nhân | Cách xử lý |
|------------|-------------|-------------|
| Syntax Error (ts, js) | Lỗi code | Sửa trong file |
| Component not rendering | JSX lỗi, props sai | Check React component |
| State not updating | Zustand/Context lỗi | Debug store |
| Routing not working | React Router config | Check App.tsx |
| UI/UX issues | CSS/Tailwind | Sửa styles |

### 3.2. Dấu hiệu lỗi từ BACKEND:
| Error Type | Cách nhận biết | Cách xử lý |
|------------|-----------------|-------------|
| 401 Unauthorized | Token không hợp lệ | Báo user check backend |
| 403 Forbidden | Không có quyền | Báo user check role |
| 404 Not Found | Endpoint không tồn tại | Báo user tạo API |
| 422 Validation Error | Data validation fail | Báo user check schema |
| 500 Internal Error | Server error | Báo user check logs |

### 3.3. Quy tắc phân biệt:
```
1. Nếu lỗi liên quan đến:
   - Syntax, TypeScript, Component → FRONTEND
   
2. Nếu lỗi liên quan đến:
   - API response (401, 403, 404, 422, 500)
   - Business logic không đúng
   - Data không lưu được
   → CÓ THỂ BACKEND → Báo user check backend

3. Luôn verify: Frontend gọi đúng API endpoint chưa?
   - Đọc API.md để xem contract
   - Check URL, method, headers, body
```

---

## PHẦN 4: CẤU TRÚC PROJECT FRONTEND

### 4.1. Các thư mục quan trọng:
```
src/
├── api/              # Gọi API (auth.api.ts, teachers.api.ts, ...)
├── components/       # UI Components (shared, layout)
├── features/         # Feature-based components (teachers, students, ...)
├── pages/            # Page components (LoginPage, Dashboard, ...)
├── stores/           # State management (auth.store.ts)
├── types/            # TypeScript types
└── App.tsx           # Main routing
```

### 4.2. Quy tắc API trong Frontend:
```
1. Public APIs (không cần auth) → Dùng axios trực tiếp
   - login, forgot-password, reset-password, register

2. Protected APIs (cần auth) → Dùng apiClient (có interceptor)
   - apiClient tự động thêm Bearer token
   - Đọc token từ localStorage.getItem('access_token')

3. Luôn dùng apiClient cho các API cần authentication
```

---

## PHẦN 5: AUTHENTICATION FLOW

### 5.1. Cách hoạt động:
```
1. Login thành công → Lưu token vào localStorage
   key: 'access_token', 'refresh_token'

2. Mọi request qua apiClient → Tự động gắn:
   Authorization: Bearer {token}

3. Khi 401 → Redirect về /login
```

### 5.2. Các file liên quan:
- `src/api/client.ts` - Interceptor thêm token
- `src/api/auth.api.ts` - Auth APIs (login, logout, changePassword...)
- `src/stores/auth.store.ts` - Auth state (Zustand)
- `src/pages/LoginPage.tsx` - Login page

---

## PHẦN 6: DEBUGGING CHECKLIST

### Khi gặp lỗi API:

- [ ] API endpoint đúng chưa? (đọc API.md)
- [ ] Method đúng chưa? (GET/POST/PATCH/DELETE)
- [ ] Headers đúng chưa? (Content-Type, Authorization)
- [ ] Body/Params đúng schema chưa?
- [ ] Cần auth không? → Dùng apiClient thay vì axios

### Khi gặp lỗi UI/Component:

- [ ] Import đúng chưa?
- [ ] Props truyền đúng chưa?
- [ ] State cập nhật đúng chưa?
- [ ] Console có lỗi gì không?

### Khi gặp lỗi Auth:

- [ ] Token có trong localStorage không?
- [ ] Token còn hết hạn không?
- [ ] apiClient được dùng chưa?
- [ ] Backend có trả về 401 không?

---

## PHẦN 7: CÁC BƯỚC KHI TẠO FEATURE MỚI

### 1. Đọc API Contract:
- Đọc API.md để hiểu endpoint
- Xác định: method, URL, body, response

### 2. Tạo/Update API:
- Thêm function trong `src/api/[module].api.ts`
- Dùng apiClient cho protected APIs

### 3. Tạo Types:
- Thêm interface trong `src/types/[module].types.ts`

### 4. Tạo UI:
- Page: `src/pages/PageName.tsx`
- Component: `src/features/[feature]/components/...`

### 5. Update Routing:
- Thêm route trong `src/App.tsx`

---

## PHẦN 8: LƯU Ý QUAN TRỌNG

1. **KHÔNG sửa backend** - Chỉ focus frontend
2. **LUÔN đọc debug_state.md** trước khi làm
3. **CẬP NHẬT debug_state.md** sau mỗi bước
4. **PHÂN BIỆT rõ** lỗi frontend vs backend
5. **BÁO user ngay** khi xác định được vấn đề từ backend

---

## TẠI SAO QUY TRÌNH NÀY HIỆU QUẢ?

1. **Tránh infinite loop**: Rule 1 (No command repetition) + debug_state.md
2. **Không mất context**: debug_state.md lưu mọi thứ
3. **Tư duy workflow**: Read → Analyze → Plan → Execute → Document
4. **Rõ ràng trách nhiệm**: Frontend chỉ làm frontend, backend báo user
5. **Giảm rủi ro**: Checklist + quy tắc rõ ràng
