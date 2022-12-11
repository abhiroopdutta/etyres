from models import CustomerDetail, Product, ProductItem, Purchase, ProductItem, Sale, ServiceItem
import datetime
import openpyxl

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
        new_item = ProductItem(
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

#--------------------------------------------------------------------------------
# delete last 2 digits of itemCode from every product in all purchase and sales invoices
#--------------------------------------------------------------------------------

    # for invoice in Purchase.objects:
    #     for product in invoice.items:
    #         old_item_code = product.itemCode
    #         new_item_code = old_item_code[:-2]
    #         Purchase.objects(invoiceNumber=invoice.invoiceNumber, items__itemCode=old_item_code).update(set__items__S__itemCode=new_item_code)

    # for invoice in Sale.objects:
    #     for product in invoice.productItems:
    #         old_item_code = product.itemCode
    #         new_item_code = old_item_code[:-2]
    #         Sale.objects(invoiceNumber=invoice.invoiceNumber, productItems__itemCode=old_item_code).update(set__productItems__S__itemCode=new_item_code)


#--------------------------------------------------------------------------------
# made the model of sale item and purchase item same
#--------------------------------------------------------------------------------
    # for invoice in Purchase.objects:
    #     for product in invoice.items:
    #         if product.HSN == "8481":
    #             rate_per_item = round((product.itemTotal/product.quantity)/1.18, 2)
    #             product.ratePerItem = rate_per_item
    #             product.CGST = 0.09
    #             product.SGST = 0.09
    #         else:
    #             rate_per_item = round((product.itemTotal/product.quantity)/1.28, 2)
    #             product.ratePerItem = rate_per_item
    #             product.CGST = 0.14
    #             product.SGST = 1.14
    #         product.IGST = 0.00
    #     invoice.save()

    # for invoice in Purchase.objects:
    #     for product in invoice.items:
    #         del product.taxableValue
    #         del product.tax
    #         del product.itemTotal
    #     invoice.save()

    # for invoice in Sale.objects:
    #     for product in invoice.productItems:
    #         del product.costPrice
    #     invoice.save()
    # return True
    