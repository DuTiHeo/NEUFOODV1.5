from flask import Blueprint, request, g
from pydantic import ValidationError
from app.db.session import get_db
from app.crud.order import (
    create_order, get_order_by_id, get_user_orders, get_all_orders, update_order_status
)
from app.core.security import jwt_required, role_required
from app.schemas.order import OrderCreateRequest, OrderStatusUpdateRequest
from app.utils.helpers import api_response

order_bp = Blueprint("orders", __name__, url_prefix="/orders")

@order_bp.route("", methods=["POST"])
def submit_order():
    auth_header = request.headers.get("Authorization", "")
    user_id = None
    if auth_header.startswith("Bearer "):
        from app.core.security import decode_access_token
        token_data = decode_access_token(auth_header.split(" ")[1])
        if token_data:
            user_id = int(token_data.get("sub"))

    try:
        data = OrderCreateRequest(**request.get_json(force=True))
    except ValidationError as e:
        return api_response(message="Dữ liệu đơn hàng không hợp lệ", errors=e.errors(), status_code=422, success=False)

    with get_db() as db:
        order = create_order(
            db=db,
            user_id=user_id,
            recipient_name=data.recipient_name,
            recipient_phone=data.recipient_phone,
            delivery_address=data.delivery_address,
            delivery_note=data.delivery_note,
            payment_method=data.payment_method,
            ship_fee=data.ship_fee,
            items_data=[item.model_dump() for item in data.items]
        )
        return api_response(
            data={"id": order.id, "total_amount": float(order.total_amount), "status": order.status},
            message="Đặt hàng thành công",
            status_code=201
        )

@order_bp.route("", methods=["GET"])
@jwt_required
def get_my_orders():
    user_id = int(g.current_user["sub"])
    with get_db() as db:
        orders = get_user_orders(db, user_id)
        data = [
            {
                "id": o.id,
                "status": o.status,
                "total_amount": float(o.total_amount),
                "ship_fee": float(o.ship_fee),
                "created_at": o.created_at.isoformat() if o.created_at else None,
                "recipient_name": o.recipient_name,
                "delivery_address": o.delivery_address,
                "items": [
                    {
                        "id": i.id,
                        "dish_id": i.dish_id,
                        "dish_name": i.dish_name,
                        "unit_price": float(i.unit_price),
                        "quantity": i.quantity,
                        "subtotal": float(i.subtotal)
                    }
                    for i in o.items
                ]
            }
            for o in orders
        ]
        return api_response(data=data)

@order_bp.route("/<order_id>", methods=["GET"])
def get_order_details(order_id: str):
    with get_db() as db:
        order = get_order_by_id(db, order_id)
        if not order:
            return api_response(message="Không tìm thấy đơn hàng", status_code=404, success=False)
        return api_response(data={
            "id": order.id,
            "status": order.status,
            "recipient_name": order.recipient_name,
            "recipient_phone": order.recipient_phone,
            "delivery_address": order.delivery_address,
            "delivery_note": order.delivery_note,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "total_amount": float(order.total_amount),
            "ship_fee": float(order.ship_fee),
            "eta": order.eta,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "items": [
                {
                    "id": i.id,
                    "dish_id": i.dish_id,
                    "dish_name": i.dish_name,
                    "unit_price": float(i.unit_price),
                    "quantity": i.quantity,
                    "note": i.note,
                    "subtotal": float(i.subtotal)
                }
                for i in order.items
            ]
        })

@order_bp.route("/admin/all", methods=["GET"])
@role_required("admin")
def get_all_orders_admin():
    status = request.args.get("status")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))

    with get_db() as db:
        orders, total = get_all_orders(db, status=status, page=page, limit=limit)
        items = [
            {
                "id": o.id,
                "status": o.status,
                "recipient_name": o.recipient_name,
                "recipient_phone": o.recipient_phone,
                "total_amount": float(o.total_amount),
                "created_at": o.created_at.isoformat() if o.created_at else None,
                "item_count": len(o.items)
            }
            for o in orders
        ]
        return api_response(data={"items": items, "total": total, "page": page, "limit": limit})

@order_bp.route("/<order_id>/status", methods=["PATCH"])
@role_required("admin")
def update_status(order_id: str):
    try:
        data = OrderStatusUpdateRequest(**request.get_json(force=True))
    except ValidationError as e:
        return api_response(message="Trạng thái không hợp lệ", errors=e.errors(), status_code=422, success=False)

    with get_db() as db:
        order = get_order_by_id(db, order_id)
        if not order:
            return api_response(message="Không tìm thấy đơn hàng", status_code=404, success=False)
        updated = update_order_status(db, order, data.status)
        return api_response(data={"id": updated.id, "status": updated.status}, message="Cập nhật trạng thái thành công")
