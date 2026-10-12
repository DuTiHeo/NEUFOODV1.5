from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class OrderItemCreate(BaseModel):
    dish_id: str
    quantity: int = Field(..., gt=0)
    note: Optional[str] = None

class OrderItemResponse(BaseModel):
    id: int
    dish_id: Optional[str] = None
    dish_name: str
    unit_price: float
    quantity: int
    note: Optional[str] = None
    subtotal: float

    class Config:
        from_attributes = True

class OrderCreateRequest(BaseModel):
    recipient_name: str = Field(..., min_length=2)
    recipient_phone: str = Field(..., min_length=8)
    delivery_address: str = Field(..., min_length=5)
    delivery_note: Optional[str] = None
    payment_method: str = "cod"
    ship_fee: float = 0
    items: List[OrderItemCreate] = Field(..., min_items=1)

class OrderStatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(pending|confirmed|preparing|delivering|delivered|cancelled)$")

class OrderResponse(BaseModel):
    id: str
    user_id: Optional[int] = None
    recipient_name: str
    recipient_phone: str
    delivery_address: str
    delivery_note: Optional[str] = None
    status: str
    total_amount: float
    ship_fee: float
    payment_method: str
    payment_status: str
    eta: Optional[str] = None
    created_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True
