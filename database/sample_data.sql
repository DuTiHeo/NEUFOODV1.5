-- ==============================================================================
-- NEUFood Database Seed Data
-- ==============================================================================

-- 1. USERS
-- Mật khẩu mặc định: 'admin123' cho admin, 'password123' cho user
-- Bcrypt hashes:
-- 'admin123'    -> '$2b$12$K89sO5p3vX9k4zV8G6v5.eT8wZ2Q2R5k2T1q0Y9X8W7V6U5T4S3R2'
-- 'password123' -> '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'

INSERT INTO users (id, email, password_hash, full_name, phone_number, student_id, role, avatar_url, is_active)
VALUES
(1, 'admin@neufood.vn', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Quản Trị Viên NEUFood', '0988888888', 'ADMIN01', 'admin', 'https://lh3.googleusercontent.com/a/ACg8ocLH7Sw6sgSRvsQhS7h3yZCLq7AKzqS9lyvNau9RnDSFxmbeFoOKow=s96-c', TRUE),
(2, 'thanhhuong050794@gmail.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Thanh Hương', '0912345678', '11200001', 'user', 'https://lh3.googleusercontent.com/a/ACg8ocLH7Sw6sgSRvsQhS7h3yZCLq7AKzqS9lyvNau9RnDSFxmbeFoOKow=s96-c', TRUE),
(3, 'sinhvien@neu.edu.vn', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Nguyễn Sinh Viên', '0977112233', '11215432', 'user', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. CATEGORIES
INSERT INTO categories (id, name, description)
VALUES
('com-hop', 'Cơm Hộp', 'Các món cơm văn phòng, sinh viên nóng hổi đủ dinh dưỡng'),
('mi-pho', 'Mì Phở', 'Bún, phở, mì xào, miến nước thanh ngọt đậm đà'),
('combos', 'Combos Tiết Kiệm', 'Combo đồ ăn kèm nước siêu hời cho sinh viên'),
('banh-kem', 'Bánh Kem', 'Bánh ngọt, bánh sinh nhật, mini pastry hấp dẫn'),
('trang-mieng', 'Tráng Miệng', 'Chè, sữa chua, caramen mát lạnh sau bữa ăn'),
('mon-chinh', 'Món Chính', 'Các món ăn no chính cho bữa trưa và bữa tối'),
('do-uong', 'Đồ Uống', 'Trà sữa, trà trái cây tươi, cà phê năng động'),
('an-vat', 'Ăn Vặt', 'Nem chua rán, khoai tây lắc, xúc xích giòn rụm')
ON CONFLICT (id) DO NOTHING;

-- 3. DISHES
INSERT INTO dishes (id, name, short_description, description, price, rating, review_count, image_url, is_available)
VALUES
('pho', 'Phở Bò Tái Lăn', 'Phở truyền thống, nước dùng thanh ngọt, thịt bò mềm.', 'Bát phở truyền thống với nước dùng được ninh từ xương bò nhiều giờ, kết hợp cùng bánh phở dai mềm và thịt bò tươi ngon.', 50000, 4.8, 312, 'https://live2makan.com/wp-content/uploads/2022/08/l2m-vn-2207-pho10-05.jpg', TRUE),
('pho-tron', 'Phở Trộn Chua Ngọt', 'Phở trộn đậm đà cùng sốt me chua ngọt.', 'Bánh phở mềm dai trộn cùng thịt bò mềm, rau sống tươi mát và nước sốt me chua ngọt đặc trưng.', 45000, 4.6, 154, 'https://cdn.tgdd.vn/2021/08/CookRecipe/Avatar/pho-ga-tron-sa-te-thumbnail.jpg', TRUE),
('bun-bo-hue', 'Bún Bò Xứ Huế', 'Bún bò chuẩn vị Huế, cay nồng, đậm đà.', 'Nước dùng thơm lừng mùi mắm ruốc và sả, full topping với thịt bò, giò heo, chả cua và tiết.', 55000, 4.9, 420, 'https://cdn.tgdd.vn/Files/2017/03/24/964495/cach-nau-bun-bo-hue-gio-heo-ngon-cong-thuc-chuan-vi-202208251617593627.jpg', TRUE),
('bun-rieu', 'Bún Riêu Cua Đồng', 'Bún riêu cua đồng thanh mát.', 'Bún riêu cua đồng với nước dùng chua thanh từ cà chua, gạch cua béo ngậy, đậu hũ chiên và chả.', 40000, 4.5, 180, 'https://i.ytimg.com/vi/C1P1Cw9J1-I/maxresdefault.jpg', TRUE),
('com-ga-xoi-mo', 'Cơm Gà Xối Mỡ Da Giòn', 'Đùi gà chiên da giòn rụm, cơm rang thơm béo.', 'Cơm rang hạt tơi màu đỏ hạt điều, ăn cùng đùi gà góc tư chiên xối mỡ giòn tan rụm và dưa chuột đồ chua.', 45000, 4.9, 530, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuUajAh5kGPqEjmbjGpLfpO4q6rXXpfhC_5in50xJi5EovQBZeLP0xvxJjmuvlMbcHFiq9EJucHKhw6D9Jb8Wo2TY4g8aIVwf849W2uGBIg3QaVES6cUgeXMwBcVUzIhkGsqutAPSD9NceZx-EV_7PlDFexQC5REP-1-I294Hr5MkPknCnv4NYnWuIcMZuj9WF4KiJ5paVqnR647hSEKDvyHa9sQgSagCNGK7PqAKOok5pVQuQTpYUvmMqgtrzsZ7vhadfOEMo6bs', TRUE),
('tra-sua-tran-chau', 'Trà Sữa Trân Châu Đường Đen', 'Vị trà ô long sữa thơm béo, trân châu mềm dẻo.', 'Trà ô long thượng hạng hòa quyện sữa béo ngậy cùng trân châu đen nấu đường nâu mềm dẻo thơm phức.', 35000, 4.7, 240, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIWzJ_Ba0WJpoHg1KAgyeZmrANZK8iiu0nFC7uWPRU45CvBNpFv6Xg3w4P8Ix8THOFrPUtjDP89zyNQUT2mGgVEMeW2V75rLmAh141lZNJTKz4GvqJgc79HL12hC8zhjT5bIBW-FIBbeQusQQeuxklKeDsHL1Zas1WKdsa7tLIvpcRIO-X59VW7kzzGvoZFMzrX_P8w76Z0jdHBMUmcVXTTyvC7K3P7GTsJq2sR2W9mBTIhRXTkXCIJqsHjCkJNzFw5VFzf5My88w', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. DISH_CATEGORIES MAPPING
INSERT INTO dish_categories (dish_id, category_id)
VALUES
('pho', 'mi-pho'),
('pho', 'mon-chinh'),
('pho-tron', 'mi-pho'),
('pho-tron', 'mon-chinh'),
('bun-bo-hue', 'mi-pho'),
('bun-bo-hue', 'mon-chinh'),
('bun-rieu', 'mi-pho'),
('bun-rieu', 'mon-chinh'),
('com-ga-xoi-mo', 'com-hop'),
('com-ga-xoi-mo', 'mon-chinh'),
('tra-sua-tran-chau', 'do-uong')
ON CONFLICT DO NOTHING;

-- 5. DISH BADGES
INSERT INTO dish_badges (dish_id, badge)
VALUES
('pho', 'bestSeller'),
('pho', 'hot'),
('bun-bo-hue', 'hot'),
('com-ga-xoi-mo', 'bestSeller'),
('tra-sua-tran-chau', 'hot')
ON CONFLICT DO NOTHING;

-- 6. ORDERS
INSERT INTO orders (id, user_id, recipient_name, recipient_phone, delivery_address, delivery_note, status, total_amount, ship_fee, payment_method, payment_status, eta)
VALUES
('NF12345', 2, 'Thanh Hương', '0912345678', 'Phòng A101, Tòa nhà A1, Đại học Kinh tế Quốc dân', 'Giao tận cửa phòng giúp em', 'delivered', 95000, 15000, 'cod', 'paid', '12:30 - 12:45'),
('NF12301', 2, 'Thanh Hương', '0912345678', 'Ký túc xá B5, Đại học Kinh tế Quốc dân', 'Gọi trước khi tới 5 phút', 'cancelled', 42000, 10000, 'momo', 'refunded', '18:15')
ON CONFLICT (id) DO NOTHING;

-- 7. ORDER_ITEMS
INSERT INTO order_items (order_id, dish_id, dish_name, unit_price, quantity, note, subtotal)
VALUES
('NF12345', 'com-ga-xoi-mo', 'Cơm Gà Xối Mỡ Da Giòn', 45000, 1, 'Extra mỡ hành', 45000),
('NF12345', 'tra-sua-tran-chau', 'Trà Sữa Trân Châu Đường Đen', 35000, 1, '50% đá, 70% đường', 35000),
('NF12301', 'pho', 'Phở Bò Tái Lăn', 50000, 1, 'Ít bánh nhiều hành', 50000)
ON CONFLICT DO NOTHING;

-- 8. REVIEWS
INSERT INTO reviews (order_id, dish_id, user_id, rating, comment)
VALUES
('NF12345', 'com-ga-xoi-mo', 2, 5, 'Gà siêu giòn, cơm nóng hổi, giao hàng rất nhanh đến tòa A1!'),
('NF12345', 'tra-sua-tran-chau', 2, 5, 'Trân châu mềm dẻo, ngọt thanh vừa vặn.')
ON CONFLICT DO NOTHING;
