from models import CustomerDetail, Product, ProductItem, Sale, ServiceItem

#if services in cart and IGST invoice, then error, fix this in future
def create_order(invoice):
    invoice_number = invoice["invoiceNumber"]
    invoice_total = invoice["invoiceTotal"]
    invoice_round_off = invoice["invoiceRoundOff"]
    customer_details = invoice["customerDetails"]
    products = invoice["products"]
    services = invoice["services"]
    
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
    for product in products:
        #update products table first
        oldstock = Product.objects(itemCode=product["itemCode"]).first().stock
        new_stock = oldstock - product["quantity"]
        Product.objects(itemCode=product["itemCode"]).first().update(stock=new_stock)

        product_item = ProductItem(
            itemDesc = product["itemDesc"], 
            itemCode = product["itemCode"], 
            HSN = product["HSN"], 
            category = product["category"], 
            size = product["size"], 
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
        invoiceTotal = invoice_total,
        invoiceRoundOff = invoice_round_off,
        customerDetails = customerDetails,
        productItems = product_items,
        serviceItems = service_items

        ).save()