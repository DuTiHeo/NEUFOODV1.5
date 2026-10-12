from flask import Flask
from .auth import auth_bp
from .user import user_bp
from .dish import dish_bp
from .order import order_bp

def register_routes(app: Flask):
    """Đăng ký tất cả các Flask Blueprints với tiền tố /api/v1."""
    api_prefix = "/api/v1"
    app.register_blueprint(auth_bp, url_prefix=f"{api_prefix}/auth")
    app.register_blueprint(user_bp, url_prefix=f"{api_prefix}/users")
    app.register_blueprint(dish_bp, url_prefix=f"{api_prefix}/dishes")
    app.register_blueprint(order_bp, url_prefix=f"{api_prefix}/orders")
