import flask_smorest
from flask import request, views
import marshmallow_mongoengine as mamo
import marshmallow as ma
from models import NoTaxSale
from services.notax import notax_service

blp = flask_smorest.Blueprint("notax", "notax", url_prefix="/api/notax", description="Operations related to non taxable sale invoices")

class NoTaxSaleSchema(mamo.ModelSchema):
    class Meta:
        model = NoTaxSale
        model_fields_kwargs = {'id': {'load_only': True}}

class NoTaxSaleQuerySchema(ma.Schema):
    invoiceNumber = ma.fields.Int()
    invoiceDateFrom = ma.fields.Str()
    invoiceDateTo = ma.fields.Str()
    vehicleNumber = ma.fields.Str()
    vehicleDesc = ma.fields.Str()

@blp.route('/invoices')
class NotaxInvoiceList(views.MethodView):
    @blp.arguments(NoTaxSaleQuerySchema, location="query")
    @blp.response(200, NoTaxSaleSchema(many=True))
    @blp.paginate()
    def get(self, args, pagination_parameters):
        '''List all non taxable sale invoices'''
        result = notax_service.get_invoices(**args, page=pagination_parameters.page, page_size=pagination_parameters.page_size)
        pagination_parameters.item_count = result["count"]
        return result["data"]

    def post(self):
        '''Create a new non taxable sale invoice'''
        return notax_service.create_invoice(**request.get_json())

@blp.route('/invoices/<invoice_number>')
class NotaxInvoice(views.MethodView):
    @blp.response(204)
    def delete(self, invoice_number):
        '''Delete non taxable sale invoice'''
        try:
            notax_service.delete_invoice(invoice_number)
        except :
            flask_smorest.abort(404, message="Item not found.")

