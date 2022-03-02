from models import CustomerDetail, Product, ProductItem, Purchase, PurchaseItem, Sale, ServiceItem
import datetime

# if services in cart and IGST invoice, then error, fix this in future
def create_order(invoice):

    invoice_number = invoice["invoiceNumber"]
    invoice_date = invoice["invoiceDate"]
    invoice_total = invoice["invoiceTotal"]
    invoice_round_off = invoice["invoiceRoundOff"]
    products = invoice["products"]
    services = invoice["services"]
    customer_details = invoice["customerDetails"]

    # If empty invoice, then error code = 1
    if not products and not services:
        print("Error! invoice is empty")
        return 1

    # if invoice date selected by user is older than previous invoice date, then error code = 2
    invoice_date = datetime.datetime.strptime(invoice_date, "%Y-%m-%d").date()
    previous_invoice = Sale.objects().order_by('-_id').first()
    if(previous_invoice is not None):
        previous_invoice_date = previous_invoice.invoiceDate.date()
        if invoice_date < previous_invoice_date:
            print("Error! invoice date selected is older than previous invoice date")
            return 2
    
    # for backdate entry, invoice "time" doesn't represent the actual time of invoice creation
    # invoice dates will always be increasing with increasing invoice number
    # but invoice time may not be increasing with increasing invoice number
    current_time = datetime.datetime.now().time()
    invoice_date = datetime.datetime.combine(invoice_date, current_time)

    customerDetails = CustomerDetail(
        name = customer_details["name"],
        address = customer_details["address"],
        GSTIN = customer_details["GSTIN"],
        stateCode = customer_details["stateCode"],
        state = customer_details["state"],
        vehicleNumber = customer_details["vehicleNumber"],
        contact = customer_details["contact"]
        )

    product_items = []
    if products:
        for product in products:
            #update products table first
            oldstock = Product.objects(itemCode=product["itemCode"]).first().stock
            new_stock = oldstock - product["quantity"]
            Product.objects(itemCode=product["itemCode"]).first().update(stock=new_stock)

            product_item = ProductItem(
                itemDesc = product["itemDesc"], 
                itemCode = product["itemCode"], 
                HSN = product["HSN"],
                costPrice = product["costPrice"], 
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
                name = service["name"], 
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
        invoiceTotal = invoice_total,
        invoiceRoundOff = invoice_round_off,
        customerDetails = customerDetails,
        productItems = product_items,
        serviceItems = service_items

        ).save()

    return 0
