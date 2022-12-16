from flask_smorest import Api
from .notax import blp as notax
from .sale import blp as sale

def initialize_api(app):
    api = Api(app)
    api.register_blueprint(notax)
    api.register_blueprint(sale)
