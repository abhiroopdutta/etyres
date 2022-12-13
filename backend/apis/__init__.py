from flask_restx import Api
from flask import Blueprint
from .notax import api as ns1

blueprint = Blueprint('api', __name__)
api = Api(
    blueprint,
    title='ETyres API',
    version='1.0',
    description='A description',
    # All API metadatas
)

api.add_namespace(ns1)