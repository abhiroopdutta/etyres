from flask_smorest import Api
from apis.notax import notax

def initialize_api(app):
    api = Api(app)
    api.register_blueprint(notax.blp)
