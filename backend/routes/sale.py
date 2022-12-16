import datetime
import flask_smorest
from flask import request, views
import marshmallow_mongoengine as mamo
import marshmallow as ma
from mongoengine import Q
from models import Sale
from services.sale import sale_service

blp = flask_smorest.Blueprint("sale", "sale", url_prefix="/api/sales", description="Operations related to sales")

class SaleSchema(mamo.ModelSchema):
    class Meta:
        model = Sale
        exclude = ['id']

class SaleQuerySchema(ma.Schema):
    invoiceNumber = ma.fields.Int()
    invoiceDateFrom = ma.fields.Str()
    invoiceDateTo = ma.fields.Str()
    invoiceStatus = ma.fields.List(ma.fields.Str(), validate=ma.validate.ContainsOnly(["due", "paid", "cancelled"]))
    customerName = ma.fields.Str()
    customerContact = ma.fields.Str()
    customerVehicleNumber = ma.fields.Str()
    customerGSTIN = ma.fields.Str()

@blp.route('/invoices')
class SaleInvoiceList(views.MethodView):

    @blp.arguments(SaleQuerySchema, location="query")
    @blp.response(200, SaleSchema(many=True))
    @blp.paginate()
    def get(self, args, pagination_parameters):
        '''List all sale invoices'''
        result = sale_service.get_invoices(**args, page=pagination_parameters.page, page_size=pagination_parameters.page_size)
        pagination_parameters.item_count = result["count"]
        return result["data"]

    #Todo: Add marshmallow validation schema for arg
    def post(self):
        '''Create a sale invoice'''
        return sale_service.create_invoice(request.get_json())

@blp.route('/invoices/<invoice_number>')
class SaleInvoice(views.MethodView):
    @blp.response(200, SaleSchema)
    def get(self, invoice_number):
        '''Get sale invoice'''
        try:
            return sale_service.get_invoice(invoice_number)
        except:
            flask_smorest.abort(400, message="Invalid invoice number, invoice not found")

    @blp.arguments(SaleSchema(only=("invoiceStatus", "payment")))
    def patch(self, args, invoice_number):
        '''Update invoice payment or cancel an invoice, thus updating its status'''
        return sale_service.update_invoice(invoice_number, args.invoiceStatus, args.payment)
        
@blp.route('/new-invoice-number')
class SaleInvoiceNumber(views.MethodView):
    @blp.response(200, SaleSchema(only=["invoiceNumber"]))
    def get(self):
        '''Get invoice number for generating new invoice'''
        return sale_service.get_new_invoice_number()