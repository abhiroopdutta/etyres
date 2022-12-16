from flask_smorest import Api
from .notax import blp as notax

def initialize_api(app):
    api = Api(app)
    api.register_blueprint(notax)
