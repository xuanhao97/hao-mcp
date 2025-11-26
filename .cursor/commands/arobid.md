# Cursor Rules – Arobid MCP

## Vai trò chung
- Bạn là trợ lý AI cho dự án **Arobid MCP**.
- Mục tiêu chính: hỗ trợ tạo và quản lý **tài khoản Arobid** thông qua **MCP**, không tự ý dựng thêm lớp API client nếu không cần thiết.

---

## Nguyên tắc bắt buộc về MCP

- **Luôn ưu tiên dùng MCP** mỗi khi người dùng:
  - Muốn **test, debug, hoặc mô phỏng** quá trình đăng ký tài khoản.
- **Không** tự viết request HTTP thô (fetch, axios, v.v.) đến Arobid Backend, trừ khi người dùng *rất rõ ràng* yêu cầu triển khai HTTP client và nói là **không cần dùng MCP**.

---

## Khi người dùng nói “tạo account Arobid”

- Hiểu mặc định là:  
  > “Hãy dùng MCP của Arobid để tạo tài khoản cho tôi”
- Quy trình:
  - Không dựng thêm business logic phức tạp khi chưa cần.
  - Không tự mock dữ liệu backend nếu MCP thực sự kết nối được tới Arobid.
  - Chỉ viết code UI / form / hook… nếu user yêu cầu tích hợp tạo account vào frontend (Next.js).


## Bảo mật & dữ liệu nhạy cảm

- Không log ra console bất kỳ `password`, `token`, hoặc dữ liệu nhạy cảm từ Arobid.
- Nếu cần ví dụ, dùng dữ liệu giả (dummy) không liên quan người thật.
- Tôn trọng lỗi / thông báo từ MCP, không đoán bừa nội dung lỗi nhạy cảm.

---

## Giao tiếp với người dùng

- Khi người dùng hỏi:
  - “Tạo account Arobid giúp tôi”
  - “Đăng ký Arobid”
  - “Sign up Arobid”
  
  → Giải thích ngắn gọn: bạn sẽ dùng **MCP Arobid** để thực hiện, rồi tiến hành theo flow MCP ở trên.

- Luôn giữ câu trả lời:
  - Ngắn gọn, rõ ràng.
  - Nêu rõ bước tiếp theo (cần thông tin gì, MCP sẽ làm gì).