import flask_smorest
from flask import request, views
import marshmallow_mongoengine as mamo
import marshmallow as ma
from models import Product
from services.product import product_service

blp = flask_smorest.Blueprint("product", "product", url_prefix="/api/products", description="Operations related to products (inventory)")

class ProductSchema(mamo.ModelSchema):
    class Meta:
        model = Product
        exclude = ['id']

@blp.route('')
class ProductList(views.MethodView):
    @blp.response(200, ProductSchema(many=True))
    def get(self):
        '''List all products'''
        result = product_service.get_products()
        return result

    def post(self):
        '''Create a product'''
        data = request.get_json()
        product_service.create_product(**data)
        return "success", 200

