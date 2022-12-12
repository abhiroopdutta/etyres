import csv	
from models import ClaimItem, Product, Purchase, ProductItem, SupplierDetail, Supplier, PurchasePayment
import glob, os
import datetime
from itertools import repeat
from flask import jsonify

def read_purchase_file(file):
    invoice = {
        "invoice_number" : "",
        "items" : []
    }

    with open(file) as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            invoice["invoice_number"] = str(row["Invoice No."]).strip()

            invoice["items"].append({
                "item_code": str(row["Material"]).strip()[:-2], 
                "item_desc": str(row["Material Desc."]).strip(),
                "quantity": int(row["Qty."]),
                "taxable_value": float(row["Net Amt."].replace(",", "")),
                "tax": float(row["Tax"].replace(",", "")),
                "item_total": float(row["Invoice Amt."].replace(",", "")),
                "not_found_in_inventory": False
                })

    os.remove(file)
    return invoice

# returns invoice with invoice["type"] = 2 for already existing invoice
# invoice["type"] = 1 for invoice with new products
# invoice["type"] = 0 for normal invoices
def process_invoice(invoice_number, items):
    invoice = {
        "type": None,
        "invoice_number": invoice_number,
        "invoice_date": datetime.datetime.now().strftime("%Y-%m-%d"),
        "special_discount": False,
        "special_discount_type": "",
        "claim_invoice": False,
        "claim_items": [],
        "overwrite_price_list": False,
        "items": [],
        "invoice_total": 0,
        "price_list_total": 0
    }

    # if invoice already exists in db, skip processing it
    if (Purchase.objects(invoiceNumber = invoice_number).first() is not None):
        invoice["type"] = 2
        return invoice
            
    # if invoice contains any item not found in inventory, mark that item, and 
    # skip processing the invoice
    for item in items:
        item_in_inventory = Product.objects(itemCode = item["item_code"]).first()
        if item_in_inventory is None:
            item["not_found_in_inventory"] = True
            continue

    if any(item["not_found_in_inventory"] for item in items):
        invoice["type"] = 1
        invoice["items"] = items
        return invoice

    # normal invoice, proceed with normal invoice calculations
    invoice["type"] = 0
    invoice["items"] = items
    for item in items:
        item_in_inventory = Product.objects(itemCode = item["item_code"]).first()
        invoice["invoice_total"] += item["item_total"]
        invoice["price_list_total"] += item_in_inventory.costPrice*item["quantity"]

        # claim_items will be populated, even though it is still unknown whether
        # this is a claim invoice or not, after getting the information of
        # from frontend (user), we decide whether to ignore the claim_items
        # or not.
        # claim_items contains a list of products(not identified by product code),
        # identified by their claim number, every phsyical product has a 
        # unique claim number 
        claim_item = {
            "item_code": item["item_code"], 
            "item_desc": item["item_desc"],
            "claim_number": 0,
            "quantity": 1,
            "taxable_value": round(item["taxable_value"]/item["quantity"], 2),
            "tax": round(item["tax"]/item["quantity"], 2),
            "item_total": round(item["item_total"]/item["quantity"], 2)
        }

        invoice["claim_items"].extend(repeat(claim_item, item["quantity"]))

    return invoice

def read_invoices(directory):
    invoices = []
    invoices_already_exist = []
    invoices_with_new_products = []
    files = glob.glob(directory + "*.xls")
    for file in files:

        invoice = read_purchase_file(file)
        processed_invoice = process_invoice(**invoice)
        if processed_invoice["type"] == 0:
            invoices.append(processed_invoice)
        elif processed_invoice["type"] == 1:
            invoices_with_new_products.append(processed_invoice)
        elif processed_invoice["type"] == 2:
            invoices_already_exist.append(processed_invoice)

    return {
        "invoices": invoices,
        "invoices_already_exist": invoices_already_exist,
        "invoices_with_new_products": invoices_with_new_products
    }

def update_stock(invoices):
    for invoice in invoices:
        #only process this invoice if it doesn't exist in DB
        if(Purchase.objects(invoiceNumber=invoice["invoice_number"]).first() is not None):
            return (jsonify("Error! Invoice already exists!"), 400)
            
        items = []
        claim_items = []
        for item in invoice["items"]:

                #update products table first
                existingProduct = Product.objects(itemCode=item["item_code"]).first()
                oldstock = existingProduct.stock
                new_stock = oldstock + item["quantity"]
                if(invoice["overwrite_price_list"]):
                    #its not cost price, its item total, divide it by quantity first then update
                    cost_price = round(item["item_total"]/item["quantity"], 2)
                    existingProduct.update(stock=new_stock, costPrice=cost_price)
                else:
                    existingProduct.update(stock=new_stock)

                rate_per_item = round((item["item_total"]/item["quantity"])/(1.0 + existingProduct.GST), 2)

                new_item = ProductItem(
                    itemDesc = existingProduct.itemDesc, 
                    itemCode = existingProduct.itemCode, 
                    HSN = existingProduct.HSN, 
                    ratePerItem = rate_per_item,
                    quantity = item["quantity"], 
                    CGST = round((existingProduct.GST/2), 2), 
                    SGST = round((existingProduct.GST/2), 2),
                    IGST = 0.0
                )

                items.append(new_item)

        invoice_number = invoice["invoice_number"]
        claim_invoice = invoice["claim_invoice"]
        if claim_invoice:
            for claim_item in invoice["claim_items"]:
                new_claim_item = ClaimItem(
                    itemDesc = Product.objects(itemCode=claim_item["item_code"]).first().itemDesc,
                    itemCode = claim_item["item_code"],
                    claimNumber = claim_item["claim_number"]
                )
                claim_items.append(new_claim_item)

        invoice_total = invoice["invoice_total"]
        special_discount = invoice["special_discount_type"] if(invoice["special_discount"]) else ""

        # if invoice date selected by user is not today (back date entry), then add time 11:30 AM, manually
        if invoice["invoice_date"] == datetime.datetime.now().strftime('%Y-%m-%d'):
            invoice_date = datetime.datetime.now()
        else:
            invoice_date = datetime.datetime.strptime(invoice["invoice_date"] + " " + "11:30:00", '%Y-%m-%d %H:%M:%S')

        
        if ("supplier_GSTIN" in invoice):
            supplier_details = SupplierDetail(
                name = invoice["supplier_name"],
                GSTIN = invoice["supplier_GSTIN"],
            )
        else:
            supplier_details = SupplierDetail(
            name = "Apollo Tyres",
            GSTIN = "09AAACA6990Q1ZW",
        )

        # if new supplier then add to supplier collection
        supplierFound = Supplier.objects(GSTIN=supplier_details.GSTIN).first()
        if (supplierFound is None):
            Supplier(GSTIN=supplier_details.GSTIN, name=supplier_details.name).save()

        payment = PurchasePayment(creditNote = 0.0, bank = 0.0, cash = 0.0)
        purchase_invoice = Purchase(
            invoiceDate =  invoice_date,
            invoiceNumber = invoice_number, 
            invoiceStatus = "due",
            specialDiscount = special_discount,
            claimInvoice = claim_invoice,
            claimItems = claim_items,
            invoiceTotal = invoice_total,
            items = items,
            supplierDetails = supplier_details,
            payment = payment,
            ).save()
    return (jsonify("stock updated, invoice saved"), 200)