import random
import time
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.db.models import Order, OrderItem, Dish

def generate_order_id() -> str:
    timestamp_part = str(int(time.time()))[-4:]
    random_part = random.randint(10, 99)
    return f"NF{timestamp_part}{random_part}"

def create_order(
    db: Session,
    user_id: Optional[int],
    recipient_name: str,
    recipient_phone: str,
    delivery_address: str,
    delivery_note: Optional[str],
    payment_method: str,
    ship_fee: float,
    items_data: list
) -> Order:
    order_id = generate_order_id()
    total_amount = float(ship_fee)

    order = Order(
        id=order_id,
        user_id=user_id,
        recipient_name=recipient_name,
        recipient_phone=recipient_phone,
        delivery_address=delivery_address,
        delivery_note=delivery_note,
        status="pending",
        ship_fee=ship_fee,
        total_amount=0,
        payment_method=payment_method,
        payment_status="unpaid" if payment_method == "cod" else "paid",
        eta="15 - 25 phút"
    )
    db.add(order)

    for item in items_data:
        dish = db.query(Dish).filter(Dish.id == item["dish_id"]).first()
        dish_name = dish.name if dish else item["dish_id"]
        unit_price = float(dish.price) if dish else 0
        quantity = int(item["quantity"])
        subtotal = unit_price * quantity
        total_amount += subtotal

        order_item = OrderItem(
            order_id=order_id,
            dish_id=item["dish_id"],
            dish_name=dish_name,
            unit_price=unit_price,
            quantity=quantity,
            note=item.get("note"),
            subtotal=subtotal
        )
        db.add(order_item)

    order.total_amount = total_amount
    db.commit()
    db.refresh(order)
    return order

def get_order_by_id(db: Session, order_id: str) -> Optional[Order]:
    return db.query(Order).filter(Order.id == order_id).first()

def get_user_orders(db: Session, user_id: int) -> List[Order]:
    return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()

def get_all_orders(
    db: Session,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20
) -> Tuple[List[Order], int]:
    query = db.query(Order)
    if status and status != "all":
        query = query.filter(Order.status == status)
    total = query.count()
    items = query.order_by(Order.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    return items, total

def update_order_status(db: Session, order: Order, new_status: str) -> Order:
    order.status = new_status
    db.commit()
    db.refresh(order)
    return order
