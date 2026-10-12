from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Numeric, Boolean, DateTime, ForeignKey, Table
)
from sqlalchemy.orm import relationship
from .session import Base

# Bảng liên kết N:N giữa Dish và Category
dish_categories = Table(
    "dish_categories",
    Base.metadata,
    Column("dish_id", String(100), ForeignKey("dishes.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", String(50), ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    phone_number = Column(String(20), nullable=True)
    student_id = Column(String(30), nullable=True)
    role = Column(String(20), nullable=False, default="user") # 'user' | 'admin'
    avatar_url = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user")

class Category(Base):
    __tablename__ = "categories"

    id = Column(String(50), primary_key=True) # slug: 'com-hop', 'mi-pho'
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    dishes = relationship("Dish", secondary=dish_categories, back_populates="categories")

class Dish(Base):
    __tablename__ = "dishes"

    id = Column(String(100), primary_key=True) # slug: 'pho', 'bun-bo-hue'
    name = Column(String(200), nullable=False)
    short_description = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(12, 2), nullable=False)
    rating = Column(Numeric(3, 2), default=5.0)
    review_count = Column(Integer, default=0)
    image_url = Column(Text, nullable=True)
    is_available = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    categories = relationship("Category", secondary=dish_categories, back_populates="dishes")
    badges = relationship("DishBadge", back_populates="dish", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="dish", cascade="all, delete-orphan")

class DishBadge(Base):
    __tablename__ = "dish_badges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dish_id = Column(String(100), ForeignKey("dishes.id", ondelete="CASCADE"), nullable=False)
    badge = Column(String(50), nullable=False)

    dish = relationship("Dish", back_populates="badges")

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(50), primary_key=True) # 'NF12345'
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    recipient_name = Column(String(150), nullable=False)
    recipient_phone = Column(String(20), nullable=False)
    delivery_address = Column(Text, nullable=False)
    delivery_note = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="pending", index=True)
    total_amount = Column(Numeric(12, 2), nullable=False)
    ship_fee = Column(Numeric(12, 2), nullable=False, default=0)
    payment_method = Column(String(30), nullable=False, default="cod")
    payment_status = Column(String(30), nullable=False, default="unpaid")
    eta = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(50), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    dish_id = Column(String(100), ForeignKey("dishes.id", ondelete="SET NULL"), nullable=True)
    dish_name = Column(String(200), nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    note = Column(Text, nullable=True)
    subtotal = Column(Numeric(12, 2), nullable=False)

    order = relationship("Order", back_populates="items")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(50), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    dish_id = Column(String(100), ForeignKey("dishes.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rating = Column(Integer, nullable=False) # 1 - 5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    order = relationship("Order", back_populates="reviews")
    dish = relationship("Dish", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
