from models import CustomerDetail, Product, ProductItem, Purchase, PurchaseItem, Sale, ServiceItem
import datetime
from flask import jsonify

def compute_gst_tables(products, services):
    GST_table = {
        "products":[],
        "services":[],
        "total":{},
        "invoiceTotal": 0,
        "invoiceRoundOff":0.0
    }

    # calculate all column values for products(tyres, valves)
    for product in products:
        GST_product = {
            "itemDesc": product["itemDesc"],
            "itemCode": product["itemCode"],
            "HSN": product["HSN"],
            "quantity": int(product["quantity"]),
            "costPrice": float(product["costPrice"]),
            "ratePerItem": 0.0,
            "taxableValue": 0.0,
            "CGST": 0.0,
            "CGSTAmount": 0.0,
            "SGST": 0.0,
            "SGSTAmount": 0.0,
            "IGST": 0.0,
            "IGSTAmount": 0.0,
            "value": 0.0,
        }

        if "ratePerItem" in product:
            GST_product["ratePerItem"] = product["ratePerItem"] 
        else:
            GST_product["ratePerItem"] = round(float(product["price"]) / (float(product["GST"]) + 1.0), 2)
        
        if "CGST" in product:
            GST_product["CGST"] = product["CGST"] 
        else:
            GST_product["CGST"] = round(float(product["GST"])/ 2.0, 2)

        if "SGST" in product:
            GST_product["SGST"] = product["SGST"] 
        else:
            GST_product["SGST"] = round(float(product["GST"])/ 2.0, 2)

        GST_product["taxableValue"] = round(GST_product["ratePerItem"] * GST_product["quantity"], 2)
        GST_product["CGSTAmount"] = round(GST_product["CGST"] * GST_product["taxableValue"], 2)
        GST_product["SGSTAmount"] = round(GST_product["SGST"] * GST_product["taxableValue"], 2)
        GST_product["value"] = round(GST_product["taxableValue"] + GST_product["CGSTAmount"] +  GST_product["SGSTAmount"], 2)
        GST_table["products"].append(GST_product)   
    
    # calculate all column values for services
    for service in services:
        GST_service = {
            "itemDesc": service["name"],
            "itemCode": "",
            "HSN": service["HSN"],
            "quantity": int(service["quantity"]),
            "costPrice": 0.0,
            "ratePerItem": 0.0,
            "taxableValue": 0.0,
            "CGST": 0.0,
            "CGSTAmount": 0.0,
            "SGST": 0.0,
            "SGSTAmount": 0.0,
            "IGST": 0.0,
            "IGSTAmount": 0.0,
            "value": 0.0,
        }

        if "ratePerItem" in service:
            GST_service["ratePerItem"] = service["ratePerItem"] 
        else:
            GST_service["ratePerItem"] = round(float(service["price"]) / (float(service["GST"]) + 1.0), 2)
        
        if "CGST" in service:
            GST_service["CGST"] = service["CGST"] 
        else:
            GST_service["CGST"] = round(float(service["GST"])/ 2.0, 2)

        if "SGST" in service:
            GST_service["SGST"] = service["SGST"] 
        else:
            GST_service["SGST"] = round(float(service["GST"])/ 2.0, 2)       

        GST_service["taxableValue"] = round(GST_service["ratePerItem"] * GST_service["quantity"], 2)
        GST_service["CGSTAmount"] = round(GST_service["CGST"] * GST_service["taxableValue"], 2)
        GST_service["SGSTAmount"] = round(GST_service["SGST"] * GST_service["taxableValue"], 2)
        GST_service["value"] = round(GST_service["taxableValue"] + GST_service["CGSTAmount"] + GST_service["SGSTAmount"], 2)
        GST_table["services"].append(GST_service)

    GST_total = {
        "quantity" : 0,
        "taxableValue" : 0.0,
        "CGSTAmount" : 0.0,
        "SGSTAmount" : 0.0,
        "IGSTAmount": 0.0,
        "value" : 0.0,
    }
    for item in GST_table["products"]+GST_table["services"]:
        GST_total["quantity"] += item["quantity"]
        GST_total["taxableValue"] += item["taxableValue"]
        GST_total["CGSTAmount"] += item["CGSTAmount"]
        GST_total["SGSTAmount"] += item["SGSTAmount"]
        GST_total["value"] += item["value"]

    GST_table["total"]["quantity"] = round(GST_total["quantity"], 2)
    GST_table["total"]["taxableValue"] = round(GST_total["taxableValue"], 2)
    GST_table["total"]["CGSTAmount"] = round(GST_total["CGSTAmount"], 2)
    GST_table["total"]["SGSTAmount"] = round(GST_total["SGSTAmount"], 2)
    GST_table["total"]["value"] = round(GST_total["value"], 2)

    GST_table["invoiceTotal"] = round(GST_total["value"])
    GST_table["invoiceRoundOff"] = round(round(GST_total["value"]) - GST_total["value"], 2)


    IGST_table = {
        "products":[],
        "services":[],
        "total":{},
        "invoiceTotal": 0,
        "invoiceRoundOff":0.0
    }

    for product in products:
        IGST_product = {
            "itemDesc": product["itemDesc"],
            "itemCode": product["itemCode"],
            "HSN": product["HSN"],
            "quantity": int(product["quantity"]),
            "costPrice": float(product["costPrice"]),
            "ratePerItem": 0.0,
            "taxableValue": 0.0,
            "CGST": 0.0,
            "CGSTAmount": 0.0,
            "SGST": 0.0,
            "SGSTAmount": 0.0,
            "IGST": 0.0,
            "IGSTAmount": 0.0,
            "value": 0.0,
        }

        if "ratePerItem" in product:
            IGST_product["ratePerItem"] = product["ratePerItem"] 
        else:
            IGST_product["ratePerItem"] = round(float(product["price"]) / (float(product["GST"]) + 1.0), 2)
        
        if "IGST" in product:
            IGST_product["IGST"] = product["IGST"] 
        else:
            IGST_product["IGST"] = round(float(product["GST"]), 2)

        IGST_product["taxableValue"] = round(IGST_product["ratePerItem"] * IGST_product["quantity"], 2)
        IGST_product["IGSTAmount"] = round(IGST_product["IGST"] * IGST_product["taxableValue"], 2)
        IGST_product["value"] = round(IGST_product["taxableValue"] + IGST_product["IGSTAmount"], 2)
        IGST_table["products"].append(IGST_product)  

    IGST_total = {
        "quantity" : 0,
        "taxableValue" : 0.0,
        "CGSTAmount" : 0.0,
        "SGSTAmount" : 0.0,
        "IGSTAmount": 0.0,
        "value" : 0.0,
    }

    for item in IGST_table["products"]:
        IGST_total["quantity"] += item["quantity"]
        IGST_total["taxableValue"] += item["taxableValue"]
        IGST_total["IGSTAmount"] += item["IGSTAmount"]
        IGST_total["value"] += item["value"]

    IGST_table["total"]["quantity"] = round(IGST_total["quantity"], 2)
    IGST_table["total"]["taxableValue"] = round(IGST_total["taxableValue"], 2)
    IGST_table["total"]["IGSTAmount"] = round(IGST_total["IGSTAmount"], 2)
    IGST_table["total"]["value"] = round(IGST_total["value"], 2)
    
    IGST_table["invoiceTotal"] = round(IGST_total["value"])
    IGST_table["invoiceRoundOff"] = round(round(IGST_total["value"]) - IGST_total["value"], 2) 

    non_tax_table = {
        "products":[],
        "services":[],
        "total":{},
        "invoiceTotal": 0,
        "invoiceRoundOff":0.0
    }

    for product in GST_table["products"]:
        non_tax_product = {
            "itemDesc": product["itemDesc"],
            "itemCode": product["itemCode"],
            "HSN": product["HSN"],
            "quantity": product["quantity"],
            "price": round(product["value"]/product["quantity"], 2),
            "value": product["value"],
        }

        non_tax_table["products"].append(non_tax_product)
    
    for service in GST_table["services"]:
        non_tax_service = {
            "itemDesc": service["itemDesc"],
            "itemCode": "",
            "HSN": service["HSN"],
            "quantity": service["quantity"],
            "price": round(service["value"]/service["quantity"], 2),
            "value": service["value"],
        }

        non_tax_table["services"].append(non_tax_service)

    non_tax_table["total"]["quantity"] = GST_table["total"]["quantity"]
    non_tax_table["total"]["value"] = GST_table["total"]["value"]

    non_tax_table["invoiceTotal"] = GST_table["invoiceTotal"]
    non_tax_table["invoiceRoundOff"] = GST_table["invoiceRoundOff"]


    return {"GST_table": GST_table,
            "IGST_table": IGST_table,
            "non_tax_table": non_tax_table}

# if services in cart and IGST invoice, then error, fix this in future
def create_order(invoice):

    invoice_number = invoice["invoiceNumber"]
    invoice_date = invoice["invoiceDate"]
    invoice_status = invoice["invoiceStatus"]
    invoice_total = invoice["invoiceTotal"]
    invoice_round_off = invoice["invoiceRoundOff"]
    products = invoice["products"]
    services = invoice["services"]
    customer_details = invoice["customerDetails"]
    payment = invoice["payment"]

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
            if (new_stock < 0):
                print(f'Error! {product["itemDesc"]}: {product["itemCode"]} out of stock!')
                return 3
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
        productItems = product_items,
        serviceItems = service_items,
        payment = payment
        ).save()

    return 0

def update_invoice_status(invoice_status_request):
    invoice = Sale.objects(invoiceNumber = invoice_status_request["invoiceNumber"]).first()
    if invoice is None:
        print(f'Trying to update status of invoice No. : {invoice_status_request["invoiceNumber"]} that does not exist in db')
        return 1

    old_invoice_status = invoice.invoiceStatus
    new_invoice_status = invoice_status_request["invoiceStatus"]

    # cannot change status of cancelled invoices
    if old_invoice_status == "cancelled":
        print(f'Error! Cannot change status of invoice No. : {invoice_status_request["invoiceNumber"]} that is already cancelled')
        return 3
    # cannot change status of paid invoices to paid/due
    if old_invoice_status == "paid" and (new_invoice_status in ["paid", "due"]):
        print(f'Error! Cannot change status of invoice No. : {invoice_status_request["invoiceNumber"]} from paid to due/paid')
        return 4

    # only 2 types of status changes are possible

    # 1. due -> paid/due
    if old_invoice_status == "due" and (new_invoice_status in ["paid", "due"]):
        payment = invoice_status_request["payment"]
        invoice.update(invoiceStatus = new_invoice_status, payment = payment)

    # In case of cancellations, reverse the stock also
    # 2. due/paid -> cancelled
    elif old_invoice_status in ["due", "paid"] and new_invoice_status == "cancelled":

        if invoice.productItems:
            # first check if each product exists in inventory
            for product in invoice.productItems:
                productFound = Product.objects(itemCode = product.itemCode).first()
                if productFound is None:
                    print(f'Error! {product["itemDesc"]}: {product["itemCode"]} not found in inventory while reversing stock, invoice could not be cancelled')
                    return 5

            # if each product exists in inventory, only then proceed to reverse stock for each product
            for product in invoice.productItems:
                productFound = Product.objects(itemCode = product.itemCode).first()
                oldstock = productFound.stock
                new_stock = oldstock + product.quantity
                Product.objects(itemCode=product["itemCode"]).first().update(stock=new_stock)

        invoice.update(invoiceStatus = new_invoice_status)


    return 0
    
def update_purchase_invoice_status(invoice_status_request):
    invoice = Purchase.objects(invoiceNumber = invoice_status_request["invoiceNumber"]).first()
    if invoice is None:
        print(f'Trying to update status of invoice No. : {invoice_status_request["invoiceNumber"]} that does not exist in db')
        return (jsonify("Error! Invoice not found in db"), 400)

    old_invoice_status = invoice.invoiceStatus
    new_invoice_status = invoice_status_request["invoiceStatus"]

    # cannot change status of cancelled invoices
    if old_invoice_status == "cancelled":
        print(f'Error! Cannot change status of invoice No. : {invoice_status_request["invoiceNumber"]} that is already cancelled')
        return (jsonify("Error! Cannot change status of already cancelled invoice"), 400)
    # cannot change status of paid invoices to paid/due
    if old_invoice_status == "paid" and (new_invoice_status in ["paid", "due"]):
        print(f'Error! Cannot change status of invoice No. : {invoice_status_request["invoiceNumber"]} from paid to due/paid')
        return (jsonify("Error! Cannot change status of invoice from paid to due"), 400)     

    # only 2 types of status changes are possible

    # implement payment method for purchase invoice later
    # 1. due -> paid/due
    # if old_invoice_status == "due" and (new_invoice_status in ["paid", "due"]):
    #     payment = invoice_status_request["payment"]
    #     invoice.update(invoiceStatus = new_invoice_status, payment = payment)

    # In case of cancellations, reverse the stock also
    # 2. due/paid -> cancelled
    elif old_invoice_status in ["due", "paid"] and new_invoice_status == "cancelled":

        if invoice.items:
            # first check if each product exists in inventory
            for product in invoice.items:
                productFound = Product.objects(itemCode = product.itemCode).first()
                if productFound is None:
                    print(f'Error! {product["itemDesc"]}: {product["itemCode"]} not found in inventory while reversing stock, invoice could not be cancelled')
                    return (jsonify("Error! Product not found in inventory, invoice could not be cancelled"), 400 )    

            # if each product exists in inventory, only then proceed to reverse stock for each product
            for product in invoice.items:
                productFound = Product.objects(itemCode = product.itemCode).first()
                oldstock = productFound.stock
                new_stock = oldstock - product.quantity
                Product.objects(itemCode=product["itemCode"]).first().update(stock=new_stock)

        invoice.update(invoiceStatus = new_invoice_status)

    return (jsonify("Invoice status successfully updated"), 200)