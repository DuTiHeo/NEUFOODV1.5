# NEUFood REST API Documentation 📡

Tài liệu đặc tả các giao diện lập trình ứng dụng RESTful API cho hệ thống **NEUFood**.

- **Phiên bản API**: `v1`
- **Tiền tố gốc**: `/api/v1`
- **Định dạng dữ liệu**: `application/json`
- **Cơ chế xác thực**: Bearer Token (JSON Web Token - JWT) trong Header: `Authorization: Bearer <access_token>`

---

## 1. Định Dạng Phản Hồi Chuẩn (Standard Response Format)

Mọi phản hồi từ API đều tuân thủ cấu trúc thống nhất:
```json
{
  "success": true,
  "message": "Thông báo trạng thái thực hiện",
  "data": { ... }
}
```

Trường hợp lỗi:
```json
{
  "success": false,
  "message": "Nội dung lỗi chi tiết",
  "errors": [ ... ]
}
```

---

## 2. Xác Thực & Người Dùng (`/api/v1/auth` & `/api/v1/users`)

### 2.1 Đăng Nhập (Login)
- **Endpoint**: `POST /api/v1/auth/login`
- **Quyền hạn**: Công khai (Public)
- **Request Body**:
```json
{
  "email": "admin@neufood.vn",
  "password": "password123"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 86400,
    "user": {
      "id": 1,
      "email": "admin@neufood.vn",
      "full_name": "Quản Trị Viên NEUFood",
      "role": "admin",
      "avatar_url": "..."
    }
  }
}
```

### 2.2 Đăng Ký (Register)
- **Endpoint**: `POST /api/v1/auth/register`
- **Quyền hạn**: Công khai (Public)
- **Request Body**:
```json
{
  "email": "sinhvien@neu.edu.vn",
  "password": "Password@123",
  "full_name": "Nguyễn Văn Sinh Viên",
  "phone_number": "0912345678",
  "student_id": "11210001"
}
```

### 2.3 Lấy Thông Tin Người Dùng Hiện Tại (Get Current User)
- **Endpoint**: `GET /api/v1/auth/me`
- **Header**: `Authorization: Bearer <access_token>`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@neufood.vn",
    "full_name": "Quản Trị Viên NEUFood",
    "phone_number": "0988888888",
    "role": "admin"
  }
}
```

---

## 3. Quản Lý Món Ăn & Danh Mục (`/api/v1/dishes`)

### 3.1 Lấy Danh Sách Món Ăn
- **Endpoint**: `GET /api/v1/dishes`
- **Query Parameters**:
  - `category` (string, optional): Lọc theo slug danh mục (`com-hop`, `mi-pho`...)
  - `search` (string, optional): Từ khóa tìm kiếm theo tên hoặc mô tả món
  - `page` (int, default: 1): Trang hiện tại
  - `limit` (int, default: 20): Số lượng bản ghi mỗi trang
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "pho",
        "name": "Phở Bò Tái Lăn",
        "price": 50000,
        "rating": 4.8,
        "review_count": 312,
        "image_url": "https://...",
        "category_ids": ["mi-pho", "mon-chinh"],
        "badges": ["bestSeller", "hot"],
        "is_available": true
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### 3.2 Lấy Chi Tiết Một Món Ăn
- **Endpoint**: `GET /api/v1/dishes/{id}`
- **Response (200 OK)**: Trả về đầy đủ thông tin chi tiết món ăn và các bài đánh giá.

### 3.3 Thêm Món Ăn Mới (Admin)
- **Endpoint**: `POST /api/v1/dishes`
- **Header**: `Authorization: Bearer <admin_token>`
- **Request Body**:
```json
{
  "id": "bun-dau-mam-tom",
  "name": "Bún Đậu Mắm Tôm Đặc Biệt",
  "short_description": "Đầy đủ dồi rán, chả cốm, nem chua rán",
  "description": "Suất bún đậu thập cẩm chuẩn vị Hà Nội...",
  "price": 45000,
  "image_url": "https://...",
  "category_ids": ["mon-chinh", "an-vat"],
  "badges": ["hot"]
}
```

### 3.4 Cập Nhật Món Ăn (Admin)
- **Endpoint**: `PUT /api/v1/dishes/{id}`
- **Header**: `Authorization: Bearer <admin_token>`

### 3.5 Xóa / Ẩn Món Ăn (Admin)
- **Endpoint**: `DELETE /api/v1/dishes/{id}`
- **Header**: `Authorization: Bearer <admin_token>`

---

## 4. Quản Lý Đơn Hàng (`/api/v1/orders`)

### 4.1 Tạo Đơn Hàng Mới
- **Endpoint**: `POST /api/v1/orders`
- **Header**: `Authorization: Bearer <access_token>`
- **Request Body**:
```json
{
  "recipient_name": "Thanh Hương",
  "recipient_phone": "0912345678",
  "delivery_address": "Phòng A101, Tòa nhà A1, Đại học Kinh tế Quốc dân",
  "delivery_note": "Giao tận phòng giúp em",
  "payment_method": "cod",
  "ship_fee": 15000,
  "items": [
    {
      "dish_id": "com-ga-xoi-mo",
      "quantity": 1,
      "note": "Extra mỡ hành"
    }
  ]
}
```

### 4.2 Lấy Lịch Sử Đơn Hàng Của Bản Thân
- **Endpoint**: `GET /api/v1/orders`
- **Header**: `Authorization: Bearer <access_token>`

### 4.3 Xem Chi Tiết Đơn Hàng
- **Endpoint**: `GET /api/v1/orders/{orderId}`

### 4.4 Danh Sách Đơn Hàng Cho Admin
- **Endpoint**: `GET /api/v1/orders/admin/all`
- **Header**: `Authorization: Bearer <admin_token>`
- **Query Parameters**: `status`, `page`, `limit`

### 4.5 Cập Nhật Trạng Thái Đơn Hàng (Admin)
- **Endpoint**: `PATCH /api/v1/orders/{orderId}/status`
- **Header**: `Authorization: Bearer <admin_token>`
- **Request Body**:
```json
{
  "status": "delivering"
}
```
*(Các trạng thái hợp lệ: `pending`, `confirmed`, `preparing`, `delivering`, `delivered`, `cancelled`)*
