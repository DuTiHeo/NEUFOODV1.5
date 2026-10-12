from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.models import Dish, Category, DishBadge

def get_categories(db: Session) -> List[Category]:
    return db.query(Category).filter(Category.is_active == True).all()

def get_dishes(
    db: Session,
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20
) -> Tuple[List[Dish], int]:
    query = db.query(Dish)

    if category_id and category_id != "all":
        query = query.filter(Dish.categories.any(Category.id == category_id))

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Dish.name.ilike(search_filter),
                Dish.short_description.ilike(search_filter),
                Dish.description.ilike(search_filter)
            )
        )

    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return items, total

def get_dish_by_id(db: Session, dish_id: str) -> Optional[Dish]:
    return db.query(Dish).filter(Dish.id == dish_id).first()

def create_dish(db: Session, data: dict) -> Dish:
    category_ids = data.pop("category_ids", [])
    badges = data.pop("badges", [])

    dish = Dish(**data)
    if category_ids:
        categories = db.query(Category).filter(Category.id.in_(category_ids)).all()
        dish.categories = categories

    db.add(dish)
    db.commit()

    if badges:
        for b in badges:
            db.add(DishBadge(dish_id=dish.id, badge=b))
        db.commit()

    db.refresh(dish)
    return dish

def update_dish(db: Session, dish: Dish, update_data: dict) -> Dish:
    category_ids = update_data.pop("category_ids", None)
    badges = update_data.pop("badges", None)

    for field, value in update_data.items():
        if hasattr(dish, field) and value is not None:
            setattr(dish, field, value)

    if category_ids is not None:
        categories = db.query(Category).filter(Category.id.in_(category_ids)).all()
        dish.categories = categories

    if badges is not None:
        db.query(DishBadge).filter(DishBadge.dish_id == dish.id).delete()
        for b in badges:
            db.add(DishBadge(dish_id=dish.id, badge=b))

    db.commit()
    db.refresh(dish)
    return dish

def delete_dish(db: Session, dish: Dish) -> None:
    db.delete(dish)
    db.commit()
