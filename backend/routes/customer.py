import flask_smorest
from flask import request, views
import marshmallow_mongoengine as mamo
from models import Customer
from services.customer import customer_service

blp = flask_smorest.Blueprint("customer", "customer", url_prefix="/api/customers", description="Operations related to customers")

class CustomerSchema(mamo.ModelSchema):
    class Meta:
        model = Customer
        exclude = ['id']

@blp.route('')
class CustomerList(views.MethodView):
    @blp.response(200, CustomerSchema(many=True))
    def get(self):
        '''List all customers'''
        result = customer_service.get_customers()
        return result

