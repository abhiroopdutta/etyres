import csv	
from models import Product, Purchase, PurchaseItem
import glob, os


def read_invoice(directory):
    invoices=[]
    files = glob.glob(directory + "*.xls")
    for file in files:
        with open(file) as f:
            reader = csv.reader(f, delimiter="\t")
            items=[]
            invoice_total = 0
            price_list_total = 0
            price_list_tally = True
            already_exists = False
            for i, row in enumerate(reader):
                if(i>0):
                    invoice_number = str(row[0])
                    items.append({
                        "item_code":str(row[2]), 
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

            if(abs(round(invoice_total)-round(price_list_total))):
                price_list_tally = False

            if(Purchase.objects(invoiceNumber=invoice_number).first()):
                already_exists = True
            invoices.append({
                "invoice_number":invoice_number,
                "already_exists":already_exists,
                "claim_invoice":False,
                "claim_number":"",
                "overwrite_price_list":False,
                "items":items,
                "invoice_total":invoice_total,
                "price_list_tally":price_list_tally
            })

        os.remove(file)


    return invoices

def update_stock(invoices):
    for invoice in invoices:
        #only process this invoice if it doesn't exist in DB
        if(Purchase.objects(invoiceNumber=invoice["invoice_number"]).first() is None):
            items = []
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
                    category = Product.objects(itemCode=item["item_code"]).first().category
                    size = Product.objects(itemCode=item["item_code"]).first().size
                    quantity = item["quantity"]
                    taxable_value = item["taxable_value"]
                    tax = item["tax"]
                    item_total = item["item_total"]

                    new_item = PurchaseItem(
                        itemDesc = item_desc, 
                        itemCode = item_code, 
                        HSN=hsn, 
                        category=category, 
                        size=size, 
                        quantity=quantity, 
                        taxableValue=taxable_value, 
                        tax=tax, 
                        itemTotal=item_total
                    )

                    items.append(new_item)

            invoice_number = invoice["invoice_number"]
            claim_invoice = invoice["claim_invoice"]
            claim_number = invoice["claim_number"]
            invoice_total = invoice["invoice_total"]

            purchase_invoice = Purchase(
                invoiceNumber = invoice_number, 
                claimInvoice = claim_invoice,
                claimNumber = claim_number,
                invoiceTotal = invoice_total,
                items = items
                ).save()