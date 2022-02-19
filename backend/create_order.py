from models import CustomerDetail, Product, ProductItem, Purchase, PurchaseItem, Sale, ServiceItem
import datetime
import openpyxl

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
#--------------------------------------------------------------------------------
# emergency functions to recover data from purchase/sales report and upload to db
#--------------------------------------------------------------------------------

# read invoices from purchase report and upload to db
def fix_purchase():
    wb = openpyxl.load_workbook('./fix_purchase.xlsx', data_only='True')
    sheet = wb.active

    invoice_number = ""
    invoice_date = "#N/A"
    claim_number = ""
    claim_invoice = False
    invoice_total = 0.0
    for row in sheet.values:
        current_invoice_number, *_ = row
        if current_invoice_number != invoice_number:

            if(invoice_date != "#N/A"):
                print(invoice_number, invoice_date, claim_number, claim_invoice, round(invoice_total))
                Purchase(
                    invoiceNumber = invoice_number, 
                    invoiceDate =  invoice_date,
                    specialDiscount = "",
                    claimInvoice = claim_invoice,
                    claimItems = [],
                    invoiceTotal = round(invoice_total),
                    items = items
                    ).save()

            invoice_number, invoice_date, claim_invoice, claim_number, *_ = row
            if(invoice_date == "#N/A"):
                continue
            claim_invoice = True if claim_invoice == "Yes" else False
            claim_number = "" if claim_number is None else claim_number
            invoice_total = 0.0
            manual_time = "10:" + datetime.datetime.now().strftime("%M:%S:%f")
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

# read invoices from sales report and upload to db
def fix_sale():
    wb = openpyxl.load_workbook('./fix_sale.xlsx', data_only='True')
    sheet = wb.active

    invoice_number = ""
    invoice_date = ""
    invoice_total = 0
    invoice_round_off = 0.0
    customer_name = ""
    customer_GSTIN = ""
    products = []
    services = []
    for row in sheet.values:
        current_invoice_number, *_ = row
        if current_invoice_number != invoice_number:
            invoice_round_off = round(round(invoice_total)-invoice_total, 2)
            print(invoice_number, invoice_date, invoice_round_off, round(invoice_total), customer_name, customer_GSTIN, products, services)
            if invoice_number:
                Sale(
                    invoiceNumber = int(invoice_number),
                    invoiceDate = invoice_date,
                    invoiceTotal = round(invoice_total),
                    invoiceRoundOff = invoice_round_off,
                    customerDetails = new_customer,
                    productItems =  products,
                    serviceItems = services
                ).save()

            invoice_number, invoice_date, *_, customer_name, customer_GSTIN = row
            manual_time = "19:" + datetime.datetime.now().strftime("%M:%S:%f")
            invoice_date = datetime.datetime.strptime(invoice_date+ " " + manual_time, "%d/%m/%Y %H:%M:%S:%f")
            invoice_total = 0.0
            invoice_round_off = 0.0
            customer_name = "" if customer_name is None else customer_name
            customer_GSTIN = "" if customer_GSTIN is None else customer_GSTIN
            new_customer = CustomerDetail(
                name = customer_name,
                address = "",
                GSTIN = customer_GSTIN,
                stateCode = "",
                state = "",
                vehicleNumber = "",
                contact = ""
            )

            products = []
            services = []

        *_, item_desc, hsn, rate_per_item, quantity, _, CGST, _, SGST, _, IGST, _, item_total, _, _ = row
        hsn = hsn.strip()
        CGST = round(((float(CGST.replace("%", "")))/100), 2)
        SGST = round(((float(SGST.replace("%", "")))/100), 2)
        IGST = round(((float(IGST.replace("%", "")))/100), 2)
        invoice_total += item_total
        if hsn == "998714":
            new_service = ServiceItem(
                name = item_desc,
                HSN = hsn,
                ratePerItem = rate_per_item, 
                quantity = quantity,
                CGST = CGST,
                SGST = SGST
            )
            services.append(new_service)
        else:
            #find product code by item_desc
            product_found = Product.objects(itemDesc = item_desc).first()
            if (product_found is None):
                print(item_desc, "NOT FOUND")
            else:
                item_code = product_found.itemCode
            new_product = ProductItem(
                itemDesc = item_desc,
                itemCode = item_code,
                HSN = hsn,
                costPrice = 0,
                ratePerItem = rate_per_item,
                quantity = quantity,
                CGST = CGST,
                SGST = SGST,
                IGST = IGST
            )
            products.append(new_product)

    return "success"