-- ==============================================================================
-- NEUFood Database DDL - PostgreSQL Schema
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TRIGGER FUNCTION: Tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. BẢNG USERS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20),
    student_id VARCHAR(30),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 4. BẢNG CATEGORIES (Danh mục món ăn)
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY, -- Slug như: 'com-hop', 'mi-pho', 'do-uong'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_categories
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 5. BẢNG DISHES (Món ăn)
CREATE TABLE IF NOT EXISTS dishes (
    id VARCHAR(100) PRIMARY KEY, -- Slug/Mã món: 'pho', 'bun-bo-hue'
    name VARCHAR(200) NOT NULL,
    short_description TEXT,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    rating NUMERIC(3, 2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INT DEFAULT 0 CHECK (review_count >= 0),
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_dishes
BEFORE UPDATE ON dishes
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 6. BẢNG QUAN HỆ DISH - CATEGORY (N:N)
CREATE TABLE IF NOT EXISTS dish_categories (
    dish_id VARCHAR(100) NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
    category_id VARCHAR(50) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (dish_id, category_id)
);

-- 7. BẢNG DISH BADGES (Nhãn món ăn: 'bestSeller', 'hot', 'new')
CREATE TABLE IF NOT EXISTS dish_badges (
    id SERIAL PRIMARY KEY,
    dish_id VARCHAR(100) NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
    badge VARCHAR(50) NOT NULL
);

-- 8. BẢNG ORDERS (Đơn đặt hàng)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY, -- Mã đơn: 'NF12345'
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    recipient_name VARCHAR(150) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_note TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled')),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    ship_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (ship_fee >= 0),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'vnpay', 'momo', 'zalopay')),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    eta VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_orders
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 9. BẢNG ORDER_ITEMS (Chi tiết món trong đơn hàng)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    dish_id VARCHAR(100) REFERENCES dishes(id) ON DELETE SET NULL,
    dish_name VARCHAR(200) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    note TEXT,
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0)
);

-- 10. BẢNG REVIEWS (Đánh giá món / đơn)
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    dish_id VARCHAR(100) REFERENCES dishes(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. INDEXES (Tối ưu hiệu năng truy vấn)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_dishes_available ON dishes(is_available);
CREATE INDEX IF NOT EXISTS idx_dish_categories_cat ON dish_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_dish_id ON reviews(dish_id);
