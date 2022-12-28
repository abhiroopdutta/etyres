from models import NoTaxSale, NoTaxItem
import datetime
from mongoengine import Q
from models import NoTaxSale, NoTaxItem
from services.transaction import transaction_service

class NoTaxSaleService:
    def create_invoice(self, invoiceDate, paymentMode, invoiceTotal, noTaxItems, vehicleNumber = "", vehicleDesc = ""):
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

        transaction_service.create_transaction(
            transactionFrom = "06",
            transactionTo = "07" if paymentMode == "cash" else "08",
            dateTime = datetime.datetime.now(),
            status = "paid",
            paymentMode = paymentMode,
            amount = invoiceTotal,
            reference_id = invoice_number,
        )

        NoTaxSale(
            invoiceNumber = invoice_number,
            invoiceDate = invoice_date,
            invoiceTotal = invoiceTotal,
            paymentMode = paymentMode,
            vehicleNumber = vehicleNumber,
            vehicleDesc = vehicleDesc,
            serviceItems = no_tax_items,
        ).save()
        return "Success! Invoice added.", 200

    def get_invoices(
        self,
        invoiceNumber= "",
        start= "",
        end= "",
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
        if (start and end):
            start_datetime = datetime.datetime.strptime(start[:10] + " " + "00:00:00", '%Y-%m-%d %H:%M:%S')
            end_datetime = datetime.datetime.strptime(end[:10] + " " + "23:59:59", '%Y-%m-%d %H:%M:%S')
            query &= Q(invoiceDate__gte=start_datetime) & Q(invoiceDate__lte=end_datetime)

        results["data"] = NoTaxSale.objects(query).order_by('-invoiceDate')[page_start:page_end]
        results["count"] = NoTaxSale.objects(query).count()
        return results

    def delete_invoice(self, invoice_number):
        invoice_to_delete = NoTaxSale.objects.get(invoiceNumber = invoice_number)
        transaction_service.delete_transaction(
            transactionFrom = "06", 
            transactionTo = "07" if invoice_to_delete.paymentMode == "cash" else "08",
            reference_id = invoice_number
        )
        invoice_to_delete.delete()

notax_service = NoTaxSaleService()