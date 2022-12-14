import datetime
import flask_smorest
from flask import request, views
import marshmallow_mongoengine as mamo
import marshmallow as ma
from mongoengine import Q
from .models import NoTaxSale, NoTaxItem

blp = flask_smorest.Blueprint("notax", "notax", url_prefix="/api/notax", description="Operations related to non taxable sale invoices")

def create_invoice(invoiceDate, invoiceTotal, noTaxItems, vehicleNumber = "", vehicleDesc = ""):
    prev_invoice = NoTaxSale.objects().order_by('-_id').first()
    if prev_invoice is None:
        invoice_number = 1
    else:
        invoice_number = prev_invoice.invoiceNumber + 1

    # if invoice date selected by user is not today (back date entry), then add time 11:30 AM, manually
    if invoiceDate == datetime.datetime.now().strftime('%Y-%m-%d'):
        invoice_date = datetime.datetime.now()
    else:
        invoice_date = datetime.datetime.strptime(invoiceDate + " " + "11:30:00", '%Y-%m-%d %H:%M:%S')

    no_tax_items = []
    for no_tax_item in noTaxItems:
        no_tax_items.append(
            NoTaxItem(
                name = no_tax_item["name"],
                price = no_tax_item["price"],
                quantity = no_tax_item["quantity"],
            )
        )

    NoTaxSale(
        invoiceNumber = invoice_number,
        invoiceDate = invoice_date,
        invoiceTotal = invoiceTotal,
        vehicleNumber = vehicleNumber,
        vehicleDesc = vehicleDesc,
        serviceItems = no_tax_items,
    ).save()
    return "Success! Invoice added.", 200

def get_invoices(
    invoiceNumber= "",
    invoiceDateFrom= "",
    invoiceDateTo= "",
    vehicleNumber = "",
    vehicleDesc = "",
    page= 1,
    page_size= 5,
):
    results = {
        "data": [],
        "count" : 0,
    }
    page_start = (page-1)*page_size
    page_end = page*page_size
    query = Q()
    if (invoiceNumber):
        query &= Q(invoiceNumber=invoiceNumber)
    if (vehicleNumber):
        query &= Q(vehicleNumber__icontains=vehicleNumber)
    if (vehicleDesc):
        query &= Q(vehicleDesc__icontains=vehicleDesc)      
    if (invoiceDateFrom and invoiceDateTo):
        start_datetime = datetime.datetime.strptime(invoiceDateFrom[:10] + " " + "00:00:00", '%Y-%m-%d %H:%M:%S')
        end_datetime = datetime.datetime.strptime(invoiceDateTo[:10] + " " + "23:59:59", '%Y-%m-%d %H:%M:%S')
        query &= Q(invoiceDate__gte=start_datetime) & Q(invoiceDate__lte=end_datetime)

    results["data"] = NoTaxSale.objects(query).order_by('-invoiceDate')[page_start:page_end]
    results["count"] = NoTaxSale.objects(query).count()
    return results

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
        result = get_invoices(**args, page=pagination_parameters.page, page_size=pagination_parameters.page_size)
        pagination_parameters.item_count = result["count"]
        return result["data"]

    def post(self):
        '''Create a new non taxable sale invoice'''
        return create_invoice(**request.get_json())