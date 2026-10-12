# Tài Liệu Thiết Kế Cơ Sở Dữ Liệu NEUFood 🗄️

Hệ thống cơ sở dữ liệu quan hệ cho NEUFood sử dụng **PostgreSQL 16+**, hỗ trợ mở rộng, ràng buộc toàn vẹn dữ liệu, trigger cập nhật thời gian và chỉ mục tối ưu truy vấn.

---

## 1. Sơ Đồ Thực Thể Quan Hệ (Entity-Relationship Diagram - ERD)

```mermaid
erDiagram
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ REVIEWS : "writes"
    CATEGORIES ||--o{ DISH_CATEGORIES : "contains"
    DISHES ||--o{ DISH_CATEGORIES : "belongs to"
    DISHES ||--o{ DISH_BADGES : "has"
    DISHES ||--o{ ORDER_ITEMS : "ordered in"
    DISHES ||--o{ REVIEWS : "reviewed in"
    ORDERS ||--|{ ORDER_ITEMS : "consists of"
    ORDERS ||--o{ REVIEWS : "includes"

    USERS {
        int id PK
        string email UK
        string password_hash
        string full_name
        string phone_number
        string student_id
        string role "user | admin"
        string avatar_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    CATEGORIES {
        string id PK "slug: com-hop, mi-pho..."
        string name
        string description
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    DISHES {
        string id PK "slug: pho, bun-bo-hue..."
        string name
        string short_description
        text description
        numeric price
        numeric rating
        int review_count
        string image_url
        boolean is_available
        timestamp created_at
        timestamp updated_at
    }

    DISH_CATEGORIES {
        string dish_id PK,FK
        string category_id PK,FK
    }

    DISH_BADGES {
        int id PK
        string dish_id FK
        string badge "bestSeller | hot | new"
    }

    ORDERS {
        string id PK "NF12345"
        int user_id FK
        string recipient_name
        string recipient_phone
        string delivery_address
        string delivery_note
        string status "pending | confirmed | preparing | delivering | delivered | cancelled"
        numeric total_amount
        numeric ship_fee
        string payment_method "cod | vnpay | momo"
        string payment_status "unpaid | paid | refunded"
        string eta
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        int id PK
        string order_id FK
        string dish_id FK
        string dish_name
        numeric unit_price
        int quantity
        string note
        numeric subtotal
    }

    REVIEWS {
        int id PK
        string order_id FK
        string dish_id FK
        int user_id FK
        int rating
        text comment
        timestamp created_at
    }
```

---

## 2. Chi Tiết Các Tệp SQL

- `init_db.sql`: Định nghĩa cấu trúc DDL hoàn chỉnh (Bảng, Khóa chính, Khóa ngoại, Ràng buộc kiểm tra, Extension, Trigger tự động cập nhật `updated_at`, Chỉ mục Index).
- `sample_data.sql`: Dữ liệu mẫu ban đầu (Danh mục món, Danh sách món ăn khớp với frontend, Tài khoản Admin mặc định, Đơn hàng mẫu và đánh giá).

---

## 3. Hướng Dẫn Cài Đặt Cục Bộ

### Sử dụng Docker (Khuyến nghị)
Khi khởi chạy bằng Docker Compose, hai tệp `init_db.sql` và `sample_data.sql` sẽ tự động được chạy trong thư mục `/docker-entrypoint-initdb.d/`:
```bash
docker compose up database -d
```

### Sử dụng psql thủ công
```bash
# Tạo cơ sở dữ liệu
createdb -U postgres neufood_db

# Chạy DDL schema
psql -U postgres -d neufood_db -f database/init_db.sql

# Nạp dữ liệu mẫu
psql -U postgres -d neufood_db -f database/sample_data.sql
```
