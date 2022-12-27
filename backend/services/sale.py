from models import CustomerDetail, Product, ProductItem, Purchase, Sale, ServiceItem, Customer
import datetime
from flask import jsonify
from services.transaction import transaction_service
from models import Sale, Product
from mongoengine import Q
import datetime
from services.customer import customer_service

class SaleService:
    # if services in cart and IGST invoice, then error, fix this in future
    def create_invoice(self, invoice):

        invoice_number = invoice["invoiceNumber"]
        invoice_date = invoice["invoiceDate"]
        invoice_status = invoice["invoiceStatus"]
        invoice_total = invoice["invoiceTotal"]
        invoice_round_off = invoice["invoiceRoundOff"]
        products = invoice["productItems"]
        services = invoice["serviceItems"]
        customer_details = invoice["customerDetails"]
        payment = invoice["payment"]

        # If empty invoice, then error code = 1
        if not products and not services:
            print("Error! invoice is empty")
            return "Error! invoice is empty", 400

        # if invoice date selected by user is older than previous invoice date, then error code = 2
        invoice_date = datetime.datetime.strptime(invoice_date, "%Y-%m-%d").date()
        previous_invoice = Sale.objects().order_by('-_id').first()
        if(previous_invoice is not None):
            previous_invoice_date = previous_invoice.invoiceDate.date()
            if invoice_date < previous_invoice_date:
                print("Error! invoice date selected is older than previous invoice date")
                return "Error! invoice date selected is older than previous invoice date", 400

        
        # for backdate entry, invoice "time" doesn't represent the actual time of invoice creation
        # invoice dates will always be increasing with increasing invoice number
        # but invoice time may not be increasing with increasing invoice number
        current_time = datetime.datetime.now().time()
        invoice_date = datetime.datetime.combine(invoice_date, current_time)

        customerDetails = CustomerDetail(
            name = customer_details["name"],
            address = customer_details["address"],
            GSTIN = customer_details["GSTIN"],
            vehicleNumber = customer_details["vehicleNumber"],
            contact = customer_details["contact"]
            )

        # if new customer then add to customer collection
        customerFound = Customer.objects(contact=customer_details["contact"]).first()
        if (customerFound is None):
            customer = customer_service.create_customer(
                customer_details["contact"],
                customer_details["name"], 
                customer_details["address"], 
                customer_details["GSTIN"], 
                customer_details["vehicleNumber"],
            )
        else:
            customer_service.update_customer(
                customer_details["contact"],
                customer_details["name"], 
                customer_details["address"], 
                customer_details["GSTIN"], 
                customer_details["vehicleNumber"],
            )
            customer = customerFound

        product_items = []
        if products:
            for product in products:
                #update products table first
                oldstock = Product.objects(itemCode=product["itemCode"]).first().stock
                new_stock = oldstock - product["quantity"]
                if (new_stock < 0):
                    print(f'Error! {product["itemDesc"]}: {product["itemCode"]} out of stock!')
                    return "Error! Item out of stock!", 400

                Product.objects(itemCode=product["itemCode"]).first().update(stock=new_stock)

                product_item = ProductItem(
                    itemDesc = product["itemDesc"], 
                    itemCode = product["itemCode"], 
                    HSN = product["HSN"],
                    ratePerItem = product["ratePerItem"], 
                    quantity = product["quantity"], 
                    CGST = product["CGST"], 
                    SGST = product["SGST"], 
                    IGST = product["IGST"]
                )
                product_items.append(product_item)

        service_items = []
        if services:
            for service in services:
                service_item = ServiceItem(
                    name = service["itemDesc"], 
                    HSN = service["HSN"], 
                    ratePerItem = service["ratePerItem"], 
                    quantity = service["quantity"], 
                    CGST = service["CGST"], 
                    SGST = service["SGST"], 
                )
                service_items.append(service_item)

        Sale(
            invoiceNumber = invoice_number, 
            invoiceDate = invoice_date,
            invoiceStatus = invoice_status,
            invoiceTotal = invoice_total,
            invoiceRoundOff = invoice_round_off,
            customerDetails = customerDetails,
            customer = customer,
            productItems = product_items,
            serviceItems = service_items,
            payment = payment
            ).save()

        for paymentMethod, paymentAmount in payment.items():
            if paymentMethod in ["card", "UPI"]:
                transactionTo = "01"
            elif paymentMethod == "cash":
                transactionTo = "00"
            
            if paymentAmount > 0 :
                transaction_service.create_transaction(
                    transactionFrom = "03",
                    transactionTo = transactionTo,
                    dateTime = datetime.datetime.now(),
                    status = "paid",
                    paymentMode = paymentMethod,
                    amount = paymentAmount,
                    reference_id = invoice_number,
                )
            
        return "stock updated, invoice saved", 200

    def get_invoices(
        self,
        invoiceNumber= "",
        start= "",
        end= "",
        invoiceStatus= "",
        customerName= "",
        customerContact= "",
        customerVehicleNumber= "",
        customerGSTIN= "",
        page= 1,
        page_size= 5,
    ):
        results = {
            "data": [],
            "count": 0
        }
        page_start = (page-1)*page_size
        page_end = page*page_size
        query = Q()
        
        if (invoiceNumber):
            query &= Q(invoiceNumber=invoiceNumber)
        if (invoiceStatus):
            query &= Q(invoiceStatus__in=invoiceStatus)
        if (customerName):
            query &= Q(customerDetails__name__icontains=customerName)
        if (customerContact):
            query &= Q(customerDetails__contact__icontains=customerContact)
        if (customerVehicleNumber):
            query &= Q(customerDetails__vehicleNumber__icontains=customerVehicleNumber)
        if (customerGSTIN):
            query &= Q(customerDetails__GSTIN__icontains=customerGSTIN)      
        if (start and end):
            start_datetime = datetime.datetime.strptime(start[:10] + " " + "00:00:00", '%Y-%m-%d %H:%M:%S')
            end_datetime = datetime.datetime.strptime(end[:10] + " " + "23:59:59", '%Y-%m-%d %H:%M:%S')
            query &= Q(invoiceDate__gte=start_datetime) & Q(invoiceDate__lte=end_datetime)

        results["data"] = Sale.objects(query).order_by('-_id')[page_start:page_end]
        results["count"] = Sale.objects(query).count()
        return results

    def get_invoice(self, invoice_number):
        sale = Sale.objects.get(invoiceNumber=invoice_number)
        return sale

    def update_invoice(self, invoice_number, invoice_status, payment):
        invoice = Sale.objects(invoiceNumber = invoice_number).first()
        if invoice is None:
            print(f'Trying to update status of invoice No. : {invoice_number} that does not exist in db')
            return jsonify("Error! Invoice not found in db"), 400

        old_invoice_status = invoice.invoiceStatus
        new_invoice_status = invoice_status

        # cannot change status of cancelled invoices
        if old_invoice_status == "cancelled":
            print(f'Error! Cannot change status of invoice No. : {invoice_number} that is already cancelled')
            return jsonify("Error! Cannot change status of already cancelled invoice"), 400
        # cannot change status of paid invoices to paid/due
        if old_invoice_status == "paid" and (new_invoice_status in ["paid", "due"]):
            print(f'Error! Cannot change status of invoice No. : {invoice_number} from paid to due/paid')
            return jsonify("Error! Cannot change status of invoice from paid to due"), 400

        # only 2 types of status changes are possible

        # 1. due -> paid/due
        if old_invoice_status == "due" and (new_invoice_status in ["paid", "due"]):
            new_payment = payment
            old_payment = invoice.payment

            diff_payment = {
            }
            for paymentMethod in old_payment:
                diff_payment[paymentMethod] = new_payment[paymentMethod] - old_payment[paymentMethod]
            
            # no change in payment
            if (all(value == 0 for value in diff_payment.values())):
                return jsonify("Payment is same as previous, no change applied"), 400

            # any value has decreased
            if (any(value < 0 for value in diff_payment.values())):
                return jsonify("Payment is less than previous, no change applied"), 400
            
            invoice.update(invoiceStatus = new_invoice_status, payment = new_payment)
            for paymentMethod, paymentAmount in diff_payment.items():
                if paymentMethod in ["card", "UPI"]:
                    transactionTo = "01"
                elif paymentMethod == "cash":
                    transactionTo = "00"

                if paymentAmount > 0 :
                    transaction_service.create_transaction(
                        transactionFrom = "03",
                        transactionTo = transactionTo,
                        dateTime = datetime.datetime.now(),
                        status = "paid",
                        paymentMode = paymentMethod,
                        amount = paymentAmount,
                        reference_id = invoice.invoiceNumber,
                    )

        # In case of cancellations, reverse the stock also
        # 2. due/paid -> cancelled
        elif old_invoice_status in ["due", "paid"] and new_invoice_status == "cancelled":

            if invoice.productItems:
                # first check if each product exists in inventory
                for product in invoice.productItems:
                    productFound = Product.objects(itemCode = product.itemCode).first()
                    if productFound is None:
                        print(f'Error! {product["itemDesc"]}: {product["itemCode"]} not found in inventory while reversing stock, invoice could not be cancelled')
                        return jsonify("Error! Product not found in inventory, invoice could not be cancelled"), 400

                # if each product exists in inventory, only then proceed to reverse stock for each product
                for product in invoice.productItems:
                    productFound = Product.objects(itemCode = product.itemCode).first()
                    oldstock = productFound.stock
                    new_stock = oldstock + product.quantity
                    Product.objects(itemCode=product["itemCode"]).first().update(stock=new_stock)

            invoice.update(invoiceStatus = new_invoice_status)
            for paymentMethod in invoice.payment:
                if paymentMethod in ["card", "UPI"]:
                    transactionFrom = "01"
                elif paymentMethod == "cash":
                    transactionFrom = "00"

                if invoice.payment[paymentMethod] > 0 :
                    transaction_service.create_transaction(
                        transactionFrom = transactionFrom,
                        transactionTo = "03",
                        dateTime = datetime.datetime.now(),
                        status = "paid",
                        paymentMode = paymentMethod,
                        amount = invoice.payment[paymentMethod],
                        reference_id = invoice.invoiceNumber,
                    )

        return jsonify("Invoice status successfully updated"), 200
    
    def get_new_invoice_number(self):
        previous_invoice = Sale.objects().order_by('-_id').first()
        if(previous_invoice is None):
            invoice_number = 1
        else:
            invoice_number = previous_invoice.invoiceNumber + 1
        return {"invoiceNumber": invoice_number}

sale_service = SaleService()
