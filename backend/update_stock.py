import csv	
from models import ClaimItem, Product, Purchase, PurchaseItem
import glob, os
import datetime

def read_invoice(directory):
    invoices=[]
    files = glob.glob(directory + "*.xls")
    for file in files:
        with open(file) as f:
            reader = csv.reader(f, delimiter="\t")
            claim_items = []
            items=[]
            invoice_total = 0
            price_list_total = 0
            already_exists = False
            for i, row in enumerate(reader):
                if(i>0):
                    invoice_number = str(row[0])
                    items.append({
                        "item_code":str(row[2]), 
                        "item_desc":str(row[3]),
                        "quantity":int(row[4]),
                        "taxable_value":float(row[5].replace(",", "")),
                        "tax":float(row[6].replace(",", "")),
                        "item_total":(float(row[7].replace(",", "")))
                        })

                    #if item doesn't exist then inform the user
                    if(Product.objects(itemCode=items[-1]["item_code"]).first() is None):
                        print("invoice number", invoice_number, items[-1]["item_code"], "item doesn't exist in inventory, please update inventory first")
                        return []
            
            for item in items:
                invoice_total += item["item_total"]
                price_list_total += Product.objects(itemCode=item["item_code"]).first().costPrice*item["quantity"]

            if(Purchase.objects(invoiceNumber=invoice_number).first()):
                already_exists = True

            # claim_items will be populated, even though it is still unknown whether
            # this is a claim invoice or not, after getting the information of
            # from frontend (user), we decide whether to ignore the claim_items
            # or not.
            # claim_items contains a list of products(not identified by product code),
            # identified by their claim number, every phsyical product has a 
            # unique claim number 
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
                "invoice_number":invoice_number,
                "invoice_date": datetime.datetime.now().strftime("%Y-%m-%d"),
                "special_discount": "",
                "already_exists":already_exists,
                "claim_invoice":False,
                "claim_items": claim_items,
                "overwrite_price_list":False,
                "items":items,
                "invoice_total":invoice_total,
                "price_list_total":round(price_list_total)
            })

        os.remove(file)


    return invoices

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
            special_discount = invoice["special_discount"]

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