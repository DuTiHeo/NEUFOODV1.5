# NEUFood - Campus Food Delivery System 🍔🚀

Hệ thống đặt và giao đồ ăn nội bộ khuôn viên trường Đại học Kinh tế Quốc dân (NEU). Dành cho sinh viên, giảng viên và cán bộ nhân viên NEU với tốc độ giao hàng nhanh, tích hợp trợ lý AI gợi ý món ăn, theo dõi đơn hàng thời gian thực và cổng quản lý bán hàng (Admin Portal).

---

## 🏗️ Cấu Trúc Dự Án (Project Structure)

```text
[NeuFood]/
├── .gitignore
├── docker-compose.yml
├── README.md
│
├── database/
│   ├── README.md                          # Hướng dẫn thiết lập, tài liệu ERD
│   ├── init_db.sql                        # Schema DDL (CREATE TABLE, EXTENSION, TRIGGER, INDEX)
│   └── sample_data.sql                    # Seed data phục vụ test cục bộ
│
├── docs/
│   ├── API_DOCUMENTATION.md               # Đặc tả các REST API endpoints
│   ├── ARCHITECTURE.md                    # Kiến trúc tổng thể và luồng dữ liệu
│   └── GETTING_STARTED.md                 # Hướng dẫn cài đặt và khởi chạy từ A-Z
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt                   # flask, sqlalchemy, psycopg2-binary, pydantic, pyjwt, bcrypt,...
│   ├── .env.example
│   ├── run.py                             # Entrypoint khởi chạy dev server (app.run)
│   └── app/
│       ├── __init__.py                    # Hàm create_app(), cấu hình CORS, Limiter, đăng ký Blueprints
│       ├── core/
│       │   ├── __init__.py
│       │   ├── config.py                  # Cấu hình nạp biến môi trường (Pydantic / BaseSettings)
│       │   ├── limiter.py                 # Khởi tạo Flask-Limiter
│       │   └── security.py                # Hash mật khẩu, JWT encode/decode, decorator @jwt_required, @role_required
│       ├── db/
│       │   ├── __init__.py
│       │   └── session.py                 # Engine SQLAlchemy, scoped_session, get_db()
│       ├── schemas/                       # DTOs Pydantic xác thực request & format response
│       │   ├── __init__.py
│       │   ├── auth.py
│       │   ├── user.py
│       │   ├── dish.py
│       │   └── order.py
│       ├── crud/                          # Data Access Layer (thao tác trực tiếp với Database)
│       │   ├── __init__.py
│       │   ├── user.py
│       │   ├── dish.py
│       │   └── order.py
│       ├── routes/                        # Flask Blueprints (API Controllers)
│       │   ├── __init__.py
│       │   ├── auth.py
│       │   ├── user.py
│       │   ├── dish.py
│       │   └── order.py
│       ├── utils/                         # Tiện ích bổ trợ (upload file, format date, validators)
│       │   ├── __init__.py
│       │   └── helpers.py
│       └── uploads/                       # Thư mục lưu trữ media nội bộ (được gitignore)
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js / postcss.config.js
    ├── index.html
    ├── .env.example                       # VITE_API_BASE_URL=http://localhost:5000/api/v1
    └── src/
        ├── main.tsx                       # Điểm neo ứng dụng React (React DOM render)
        ├── App.tsx                        # Thiết lập Router, Provider bọc ngoài
        ├── routes/                        # Cấu hình danh sách routes (React Router DOM)
        │   ├── index.tsx
        │   └── ProtectedRoute.tsx         # Component chặn truy cập nếu chưa login hoặc sai role
        ├── pages/                         # Các trang giao diện phân theo chức năng/vai trò
        │   ├── auth/
        │   │   ├── LoginPage.tsx
        │   │   ├── ForgotPasswordPage.tsx
        │   │   ├── RegisterPage.tsx
        │   │   └── OAuthCallbackPage.tsx
        │   ├── admin/
        │   │   ├── AdminBaoCaoPage.tsx
        │   │   ├── AdminDonPage.tsx
        │   │   ├── AdminLoginPage.tsx
        │   │   ├── AdminMonPage.tsx
        │   │   ├── AdminSuaMonPage.tsx
        │   │   └── AdminThemMonPage.tsx
        │   ├── user/
        │   │   ├── HomePage.tsx
        │   │   ├── MenuPage.tsx
        │   │   ├── ChiTietMonPage.tsx
        │   │   ├── GioHangPage.tsx
        │   │   ├── ThanhToanPage.tsx
        │   │   ├── DonHangPage.tsx
        │   │   ├── LichSuDonHangPage.tsx
        │   │   ├── TaiKhoanPage.tsx
        │   │   ├── GanNeuPage.tsx
        │   │   ├── RecruitPage.tsx
        │   │   └── StoryPage.tsx
        │   └── not-found/
        │       └── NotFoundPage.tsx
        ├── components/
        │   ├── common/                    # Nút bấm, Ô nhập, Modal, Spinner, Bảng...
        │   │   ├── Button.tsx
        │   │   ├── Input.tsx
        │   │   ├── Modal.tsx
        │   │   └── Table.tsx
        │   ├── layout/                    # Khung sườn (Navbar, Sidebar, Footer, Layout wrapper)
        │   │   ├── MainLayout.tsx
        │   │   ├── Navbar.tsx
        │   │   ├── Sidebar.tsx
        │   │   ├── Footer.tsx
        │   │   └── BottomNav.tsx
        │   ├── dishes/
        │   │   └── FoodCard.tsx
        │   ├── chatbot/
        │   │   └── ChatbotWidget.tsx
        │   └── orders/
        │       └── OrderReviewModal.tsx
        ├── contexts/                      # React Context API (Global state)
        │   ├── AuthContext.tsx
        │   ├── ThemeContext.tsx
        │   ├── CartContext.tsx
        │   ├── OrderHistoryContext.tsx
        │   ├── MenuSearchContext.tsx
        │   ├── AdminAuthContext.tsx
        │   └── AdminDishesContext.tsx
        ├── hooks/                         # Custom React Hooks
        │   ├── useAuth.ts
        │   ├── useDebounce.ts
        │   └── useAdminDishes.ts
        ├── services/                      # Giao tiếp HTTP với Backend
        │   ├── api.ts                     # Axios client cấu hình BaseURL & Request/Response Interceptor JWT
        │   ├── authService.ts             # Các hàm gọi API auth: login, logout, getMe
        │   ├── dishService.ts
        │   └── orderService.ts
        ├── types/                         # TypeScript interfaces/types định nghĩa DTOs & Models
        │   ├── auth.ts
        │   ├── user.ts
        │   ├── dish.ts
        │   └── order.ts
        ├── constants/                     # Hằng số (Routes path, Enum roles, App settings)
        └── styles/                        # File CSS toàn cục (Tailwind/Custom styles)
            └── index.css
```

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Chart.js, React Router DOM v7.
- **Backend**: Python 3.11+, Flask (Application Factory), SQLAlchemy ORM, Pydantic v2 (Data Validation & Serialization), PyJWT, Bcrypt, Flask-CORS, Flask-Limiter.
- **Database**: PostgreSQL 16+ (Trigger tự động cập nhật timestamps, Index tối ưu truy vấn).
- **DevOps**: Docker, Docker Compose đa dịch vụ (Database, Backend, Frontend).

---

## 🚀 Khởi Chạy Nhanh (Quick Start)

### Chạy riêng Frontend để demo

Không cần khởi chạy Docker, backend hoặc database nếu chỉ cần mở giao diện.

Yêu cầu: **Node.js 20.19+** (hoặc **22.12+**) và npm.

```bash
cd frontend
npm ci
npm run dev
```

Mở địa chỉ được Vite hiển thị trong terminal, mặc định là [http://localhost:5173](http://localhost:5173). Giữ terminal này chạy trong lúc demo; nhấn `Ctrl+C` để dừng.

Để kiểm tra bản build trước khi demo, chạy trong thư mục `frontend`:

```bash
npm run build
npm run preview
```

Giao diện có thể mở độc lập, nhưng các chức năng cần dữ liệu từ API (ví dụ đăng nhập, tải món ăn hoặc thao tác đơn hàng) sẽ không hoạt động đầy đủ nếu backend không chạy. Frontend mặc định gọi API tại `http://localhost:5000/api/v1`; có thể thay đổi bằng biến `VITE_API_BASE_URL` trong file `frontend/.env`.

### Chạy toàn bộ hệ thống bằng Docker Compose

```bash
docker compose up --build -d
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **PostgreSQL**: `localhost:5432` (User: `neufood_user`, DB: `neufood_db`)

### Chạy thủ công các thành phần
Xem hướng dẫn chi tiết tại [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md).

---

## 📚 Tài Liệu Kỹ Thuật (Documentation)

- [Tài liệu Kiến Trúc Hệ Thống (docs/ARCHITECTURE.md)](docs/ARCHITECTURE.md)
- [Đặc tả REST API Endpoints (docs/API_DOCUMENTATION.md)](docs/API_DOCUMENTATION.md)
- [Hướng dẫn Cài Đặt Chi Tiết (docs/GETTING_STARTED.md)](docs/GETTING_STARTED.md)
- [Thiết kế Cơ sở Dữ liệu & ERD (database/README.md)](database/README.md)