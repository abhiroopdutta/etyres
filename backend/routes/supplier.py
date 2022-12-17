import flask_smorest
from flask import request, views
import marshmallow_mongoengine as mamo
from models import Supplier
from services.supplier import supplier_service

blp = flask_smorest.Blueprint("supplier", "supplier", url_prefix="/api/suppliers", description="Operations related to suppliers")

class SupplierSchema(mamo.ModelSchema):
    class Meta:
        model = Supplier
        exclude = ['id']

@blp.route('')
class SupplierList(views.MethodView):
    @blp.response(200, SupplierSchema(many=True))
    def get(self):
        '''List all suppliers'''
        result = supplier_service.get_suppliers()
        return result

