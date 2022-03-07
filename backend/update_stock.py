import csv	
from models import ClaimItem, Product, Purchase, PurchaseItem
import glob, os
import datetime

def read_invoice(file):
    with open(file) as f:
        reader = csv.DictReader(f, delimiter="\t")

        items = []
        for row in reader:
            invoice_number = str(row["Invoice No."]).strip()

            items.append({
                "item_code":str(row["Material"]).strip(), 
                "item_desc":str(row["Material Desc."]).strip(),
                "quantity":int(row["Qty."]),
                "taxable_value":float(row["Net Amt."].replace(",", "")),
                "tax":float(row["Tax"].replace(",", "")),
                "item_total":(float(row["Invoice Amt."].replace(",", "")))
                })

        return (invoice_number, items)

def read_invoices(directory):
    invoices = []
    invoices_already_loaded = []
    items_not_in_inventory = []
    files = glob.glob(directory + "*.xls")
    for file in files:

        invoice_number, items = read_invoice()

        # if invoice already exists in db, skip processing it, but report to user
        if (Purchase.objects(invoiceNumber = invoice_number).first() is not None):
            invoices_already_loaded.append(invoice_number)
            continue
            
        for item in items:
            item_in_inventory = Product.objects(itemCode = item["item_code"]).first()
            if item_in_inventory is None:
                if invoice_number in items_not_in_inventory:
                    items_not_in_inventory[invoice_number].append(item["item_code"])
                else:
                    items_not_in_inventory[invoice_number] = [item["item_code"]]
                continue

            invoice_total += item["item_total"]
            price_list_total += item_in_inventory.costPrice*item["quantity"]

        # if this invoice contains items that don't exist in inventory, skip it
        # but report it to user
        if invoice_number in item_in_inventory:
            os.remove(file)
            continue

        # claim_items will be populated, even though it is still unknown whether
        # this is a claim invoice or not, after getting the information of
        # from frontend (user), we decide whether to ignore the claim_items
        # or not.
        # claim_items contains a list of products(not identified by product code),
        # identified by their claim number, every phsyical product has a 
        # unique claim number 
        claim_items = []
        for item in items:
            for i in range(item["quantity"]):
                claim_items.append({
                    "item_code":item["item_code"], 
                    "item_desc":item["item_desc"],
                    "claim_number":0,
                    "quantity":1,
                    "taxable_value":round(item["taxable_value"]/item["quantity"], 2),
                    "tax":round(item["tax"]/item["quantity"], 2),
                    "item_total":round(item["item_total"]/item["quantity"], 2)
                })
        
        invoices.append({
            "invoice_number": invoice_number,
            "invoice_date": datetime.datetime.now().strftime("%Y-%m-%d"),
            "special_discount": False,
            "special_discount_type": "",
            "claim_invoice":False,
            "claim_items": claim_items,
            "overwrite_price_list":False,
            "items": items,
            "invoice_total":invoice_total,
            "price_list_total":round(price_list_total)
        })

        os.remove(file)


    return {
        "invoices": invoices,
        "invoices_already_loaded": invoices_already_loaded,
        "items_not_in_inventory": items_not_in_inventory
    }

def update_stock(invoices):
    for invoice in invoices:
        #only process this invoice if it doesn't exist in DB
        if(Purchase.objects(invoiceNumber=invoice["invoice_number"]).first() is None):
            items = []
            claim_items = []
            for item in invoice["items"]:

                    #update products table first
                    oldstock = Product.objects(itemCode=item["item_code"]).first().stock
                    new_stock = oldstock + item["quantity"]
                    if(invoice["overwrite_price_list"]):
                        #its not cost price, its item total, divide it by quantity first then update
                        cost_price = round(item["item_total"]/item["quantity"], 2)
                        Product.objects(itemCode=item["item_code"]).first().update(stock=new_stock, costPrice=cost_price)
                    else:
                        Product.objects(itemCode=item["item_code"]).first().update(stock=new_stock)

                    #get extra details of each product from Products table, to prepare to load to Purchases table
                    item_desc = Product.objects(itemCode=item["item_code"]).first().itemDesc
                    item_code = item["item_code"]
                    hsn = Product.objects(itemCode=item["item_code"]).first().HSN
                    quantity = item["quantity"]
                    taxable_value = item["taxable_value"]
                    tax = item["tax"]
                    item_total = item["item_total"]

                    new_item = PurchaseItem(
                        itemDesc = item_desc, 
                        itemCode = item_code, 
                        HSN=hsn, 
                        quantity=quantity, 
                        taxableValue=taxable_value, 
                        tax=tax, 
                        itemTotal=item_total
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
            special_discount = invoice["special_discount_type"]

            # if invoice date selected by user is not today (back date entry), then add time 11:30 AM, manually
            if invoice["invoice_date"] == datetime.datetime.now().strftime('%Y-%m-%d'):
                invoice_date = datetime.datetime.now()
            else:
                invoice_date = datetime.datetime.strptime(invoice["invoice_date"] + " " + "11:30:00", '%Y-%m-%d %H:%M:%S')

            purchase_invoice = Purchase(
                invoiceDate =  invoice_date,
                invoiceNumber = invoice_number, 
                specialDiscount = special_discount,
                claimInvoice = claim_invoice,
                claimItems = claim_items,
                invoiceTotal = invoice_total,
                items = items
                ).save()