from models import CustomerDetail, Product, ProductItem, Purchase, PurchaseItem, Sale, ServiceItem
import datetime
import openpyxl

# if services in cart and IGST invoice, then error, fix this in future
def create_order(invoice):
    invoice_number = invoice["invoiceNumber"]
    if(invoice["initialSetup"]):
        manual_time = "19:" + datetime.datetime.now().strftime("%M:%S")
        invoice_date = datetime.datetime.strptime(invoice["invoiceDate"]+ " " + manual_time, "%d-%m-%Y %H:%M:%S")
    else:
        invoice_date = datetime.datetime.now()
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
        invoiceDate = invoice_date,
        invoiceTotal = invoice_total,
        invoiceRoundOff = invoice_round_off,
        customerDetails = customerDetails,
        productItems = product_items,
        serviceItems = service_items

        ).save()


# read invoices from sales report and upload to db
def fix():
    wb = openpyxl.load_workbook('./fix_purchase.xlsx', data_only='True')
    sheet = wb.active

    invoice_number = ""
    invoice_date = "#N/A"
    claim_number = ""
    claim_invoice = False
    invoice_total = 0
    for row in sheet.values:
        current_invoice_number, *_ = row
        if current_invoice_number != invoice_number:

            if(invoice_date != "#N/A"):
                print(invoice_number, invoice_date, claim_number, claim_invoice, round(invoice_total))
                Purchase(
                    invoiceDate =  invoice_date,
                    invoiceNumber = str(invoice_number), 
                    claimInvoice = claim_invoice,
                    claimNumber = claim_number,
                    invoiceTotal = invoice_total,
                    items = items
                    ).save()

            invoice_number, invoice_date, claim_invoice, claim_number, *_ = row
            if(invoice_date == "#N/A"):
                continue
            claim_invoice = True if claim_invoice == "Yes" else False
            claim_number = "" if claim_number is None else claim_number
            invoice_total = 0
            manual_time = "19:" + datetime.datetime.now().strftime("%M:%S:%f")
            invoice_date = datetime.datetime.strptime(invoice_date+ " " + manual_time, "%d.%m.%Y %H:%M:%S:%f")
            items = []

        *_, item_desc, item_code, hsn, quantity, taxable_val, tax, item_total = row
        invoice_total += item_total
        new_item = PurchaseItem(
            itemDesc = item_desc,
            itemCode = item_code,
            HSN = hsn,
            quantity = quantity, 
            taxableValue = taxable_val,
            tax = tax,
            itemTotal = item_total
        )
        items.append(new_item)

    return "success"