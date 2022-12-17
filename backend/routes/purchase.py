import flask_smorest
from flask import request, views
import marshmallow_mongoengine as mamo
import marshmallow as ma
from models import Purchase
from services.purchase import purchase_service

blp = flask_smorest.Blueprint("purchase", "purchase", url_prefix="/api/purchases", description="Operations related to purchases")

class PurchaseSchema(mamo.ModelSchema):
    class Meta:
        model = Purchase
        exclude = ['id']

class PurchaseQuerySchema(ma.Schema):
    invoiceNumber = ma.fields.Int()
    invoiceDateFrom = ma.fields.Str()
    invoiceDateTo = ma.fields.Str()
    invoiceStatus = ma.fields.List(ma.fields.Str(), validate=ma.validate.ContainsOnly(["due", "paid", "cancelled"]))
    supplierName = ma.fields.Str()
    supplierGSTIN = ma.fields.Str()
    claimInvoice = ma.fields.Str(validate=ma.validate.OneOf(["true", "false"]))

@blp.route('/invoices')
class PurchaseInvoiceList(views.MethodView):

    @blp.arguments(PurchaseQuerySchema, location="query")
    @blp.response(200, PurchaseSchema(many=True))
    @blp.paginate()
    def get(self, args, pagination_parameters):
        '''List all purchase invoices'''
        result = purchase_service.get_invoices(**args, page=pagination_parameters.page, page_size=pagination_parameters.page_size)
        pagination_parameters.item_count = result["count"]
        return result["data"]

    #Todo: Add marshmallow validation schema for arg
    def post(self):
        '''Create one or more purchase invoices (i.e. supports bulk creation)'''
        return purchase_service.create_invoices(request.get_json())

@blp.route('/invoices/<invoice_number>')
class PurchaseInvoice(views.MethodView):
    @blp.arguments(PurchaseSchema(only=("invoiceStatus", "payment")))
    def patch(self, args, invoice_number):
        '''Update invoice payment or cancel an invoice, thus updating its status'''
        return purchase_service.update_invoice(invoice_number, args.invoiceStatus, args.payment)
        

    