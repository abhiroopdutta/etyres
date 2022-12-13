from flask_restx import Namespace, Resource
from flask import jsonify, request
from models import NoTaxSale, NoTaxItem
import datetime

api = Namespace('notax', description='Non taxable sale related operations')

def add_no_tax_invoice(invoiceDate, invoiceTotal, noTaxItems, vehicleNumber = "", vehicleDesc = ""):
    prev_invoice = NoTaxSale.objects().order_by('-_id').first()
    if prev_invoice is None:
        invoice_number = 0
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

@api.route('/invoices')
class NotaxInvoiceList(Resource):
    def get(self):
        '''List all non taxable sale invoices'''
        return jsonify(NoTaxSale.objects().order_by('-_id'))

    def post(self):
        '''Create a new non taxable sale invoice'''
        return add_no_tax_invoice(**request.get_json())