from models import NoTaxSale, NoTaxItem
import datetime
from mongoengine import Q
from models import NoTaxSale, NoTaxItem

class NoTaxSaleService:
    def create_invoice(self, invoiceDate, invoiceTotal, noTaxItems, vehicleNumber = "", vehicleDesc = ""):
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
        self,
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

    def delete_invoice(self, invoice_number):
        invoice_to_delete = NoTaxSale.objects.get(invoiceNumber = invoice_number)
        invoice_to_delete.delete()

notax_service = NoTaxSaleService()