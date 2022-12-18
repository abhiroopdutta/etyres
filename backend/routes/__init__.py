from flask_smorest import Api
from .notax import blp as notax
from .sale import blp as sale
from .purchase import blp as purchase
from .transaction import blp as transaction
from .header import blp as header
from .supplier import blp as supplier
from .product import blp as product

def initialize_api(app):
    api = Api(app)
    api.register_blueprint(notax)
    api.register_blueprint(sale)
    api.register_blueprint(purchase)
    api.register_blueprint(transaction)
    api.register_blueprint(header)
    api.register_blueprint(supplier)
    api.register_blueprint(product)
