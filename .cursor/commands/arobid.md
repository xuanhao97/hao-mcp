# Arobid MCP – Project Rules

## 1. Bắt buộc sử dụng Arobid MCP

- Mọi thao tác backend, tài khoản, database, hoặc logic hệ thống **phải thông qua Arobid MCP**.
- Không được tự tạo API, server, hay mock logic khi MCP đã có khả năng xử lý.
- Nếu MCP chưa hỗ trợ → đề xuất bổ sung thay vì tự xử lý ngoài hệ thống.

---

## 2. Tự hành động (No-Plan Mode)

- AI **tự thực thi yêu cầu ngay**, không cần tạo development plan, không cần chờ xác nhận.
- Chỉ hỏi lại khi yêu cầu không rõ hoặc thiếu dữ liệu quan trọng.
- Quy trình mặc định:
  - Phân tích → Hành động → Trả kết quả cuối.

---

## 3. Không liệt kê tool MCP đang chạy

- Khi sử dụng MCP:
  - **Không liệt kê danh sách tool**
  - **Không mô tả tool nào đang được gọi**
  - **Không giải thích cơ chế nội bộ của MCP**
- Chỉ đưa ra:
  - **Kết quả cuối cùng**
  - **Giải thích ngắn gọn lý do hoặc logic (nếu cần)**

Ví dụ:
❌ Không:  
“Đang dùng tool `mcp.createAccount` để tạo tài khoản…”

✔ Đúng:  
“Tài khoản đã được tạo thành công.”

---

## 4. Quy tắc Search (cursor.search & internal search)

- Trả kết quả nhanh, rõ, đúng trọng tâm.
- Không suy luận quá mức khi search không cung cấp thông tin.
- Không lặp tìm kiếm vô hạn.

Nếu search không có dữ liệu phù hợp:

> “Không tìm thấy kết quả phù hợp, vui lòng cung cấp thêm thông tin.”

---

## 5. Tránh vòng lặp vô hạn

- Khi phát hiện logic có nguy cơ lặp liên tục → dừng lại và báo lỗi ngắn gọn + hướng xử lý.
- Không cố gắng tiếp tục khi không có dữ liệu.

---

## 6. Ưu tiên tốc độ + độ chính xác

- Có đủ thông tin → thực thi ngay.
- Thiếu thông tin → yêu cầu input thay vì đoán.

---

## 7. Response Format

Mỗi phản hồi phải theo chuẩn:

### **Context**

Đang giải quyết điều gì.

### **Action**

Việc AI đã thực hiện (không mô tả tool MCP).

### **Result**

Kết quả cuối cùng.

### **Next Step**

Hành động đề xuất hoặc bước tiếp theo.

---

## 8. Consistency với Arobid Backend

- Code phải tuân theo:
  - Cấu trúc dự án Arobid
  - Naming convention
  - Logic xử lý qua MCP
- Không tự ý tạo kiến trúc mới trừ khi user yêu cầu.

---

## 9. Code Style (TypeScript + Next.js)

- Ưu tiên:
  - Server Actions khi phù hợp
  - TypeScript 100%
  - Zod để validate input
  - Tối ưu cho Vercel
  - Không sử dụng fetch thủ công thay cho MCP

---

## 10. Chất lượng & An toàn

- Không hardcode giá trị quan trọng.
- Tránh duplicate.
- Code phải rõ ràng và dễ bảo trì.
- Tất cả thay đổi phải có thể truy vết từ yêu cầu ban đầu.

---

## 11. Chủ động tối ưu nhưng không tự ý thay đổi

- AI được phép đề xuất cải thiện.
- Chỉ thực hiện thay đổi cảm tính khi được user đồng ý.
- Fix bug rõ ràng → tự xử lý luôn.

---

# Kết thúc tài liệu
