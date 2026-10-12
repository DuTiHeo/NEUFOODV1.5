# Hướng Dẫn Cài Đặt & Khởi Chạy NEUFood Từ A-Z 🚀

Hướng dẫn này sẽ giúp bạn thiết lập và khởi chạy toàn bộ hệ thống **NEUFood** trên môi trường phát triển cục bộ (Local Development).

---

## 1. Yêu Cầu Hệ Thống (Prerequisites)

- **Cách 1 (Khuyên dùng)**: Chỉ cần cài đặt [Docker](https://www.docker.com/) & Docker Compose.
- **Cách 2 (Thủ công)**:
  - Python >= 3.11
  - Node.js >= 18 và npm / pnpm
  - PostgreSQL >= 15

---

## 2. Khởi Chạy Nhanh Với Docker Compose (Cách 1)

Chỉ với 1 câu lệnh duy nhất, hệ thống sẽ tự động khởi động Database PostgreSQL, nạp schema & dữ liệu mẫu, build Flask Backend và Vite Frontend:

```bash
# Tại thư mục gốc của dự án NeuFood:
docker compose up --build
```

Sau khi các container báo Ready:
- **Giao diện người dùng (Frontend)**: [http://localhost:5173](http://localhost:5173)
- **Cổng API Backend**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Cơ sở dữ liệu (PostgreSQL)**: `localhost:5432`

Để dừng hệ thống:
```bash
docker compose down
```

---

## 3. Cài Đặt Thủ Công Từng Phần (Cách 2)

### Bước 1: Khởi tạo Cơ sở dữ liệu PostgreSQL
1. Đảm bảo dịch vụ PostgreSQL đang chạy trên máy của bạn.
2. Tạo cơ sở dữ liệu và nạp dữ liệu khởi tạo:
```bash
createdb -U postgres neufood_db
psql -U postgres -d neufood_db -f database/init_db.sql
psql -U postgres -d neufood_db -f database/sample_data.sql
```

### Bước 2: Cấu hình và chạy Backend (Python Flask)
1. Di chuyển vào thư mục backend:
```bash
cd backend
```
2. Tạo môi trường ảo Python và kích hoạt:
```bash
python3 -m venv venv
# Trên macOS / Linux:
source venv/bin/activate
# Trên Windows:
venv\Scripts\activate
```
3. Cài đặt các thư viện phụ thuộc:
```bash
pip install -r requirements.txt
```
4. Thiết lập biến môi trường:
```bash
cp .env.example .env
# Chỉnh sửa file .env nếu thông số kết nối Database của bạn khác mặc định
```
5. Khởi chạy dev server backend:
```bash
python run.py
```
Server sẽ chạy tại `http://localhost:5000`.

### Bước 3: Cấu hình và chạy Frontend (React + Vite)
1. Mở một cửa sổ Terminal mới và di chuyển vào thư mục frontend:
```bash
cd frontend
```
2. Cài đặt các gói thư viện npm:
```bash
npm install
```
3. Tạo file biến môi trường:
```bash
cp .env.example .env
```
4. Khởi chạy giao diện Frontend:
```bash
npm run dev
```
Mở trình duyệt tại địa chỉ: `http://localhost:5173`.

---

## 4. Tài Khoản Thử Nghiệm Mặc Định (Default Credentials)

Dữ liệu mẫu (`database/sample_data.sql`) cung cấp sẵn các tài khoản sau:

| Vai trò (Role) | Email | Mật khẩu (Password) | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@neufood.vn` | `password123` | Quản lý món ăn, duyệt đơn, xem báo cáo doanh thu |
| **Sinh Viên** | `thanhhuong050794@gmail.com` | `password123` | Đặt món, giỏ hàng, đánh giá, theo dõi đơn |
| **Sinh Viên** | `sinhvien@neu.edu.vn` | `password123` | Đặt món, giỏ hàng, đánh giá, theo dõi đơn |
