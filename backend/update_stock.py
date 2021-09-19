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
                        "cost_price":(float(row[7].replace(",", "")))
                        })

                    #if item doesn't exist then inform the user
                    if(Product.objects(item_code=items[-1]["item_code"]).first() is None):
                        print("invoice number", invoice_number, items[-1]["item_code"], "item doesn't exist in inventory, please update inventory first")
                        return []
            
            for item in items:
                invoice_total += item["cost_price"]
                price_list_total += Product.objects(item_code=item["item_code"]).first().cost_price*item["quantity"]

            if(abs(round(invoice_total)-round(price_list_total))):
                price_list_tally = False

            if(Purchase.objects(invoice_number=invoice_number).first()):
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
        if(Purchase.objects(invoice_number=invoice["invoice_number"]).first() is None):
            items = []
            for item in invoice["items"]:

                    #update products table first
                    oldstock = Product.objects(item_code=item["item_code"]).first().stock
                    new_stock = oldstock + item["quantity"]
                    if(invoice["overwrite_price_list"]):
                        Product.objects(item_code=item["item_code"]).first().update(stock=new_stock, cost_price=item["cost_price"])
                    else:
                        Product.objects(item_code=item["item_code"]).first().update(stock=new_stock)

                    #get extra details of each product from Products table, to prepare to load to Purchases table
                    item_desc = Product.objects(item_code=item["item_code"]).first().item_desc
                    item_code = item["item_code"]
                    hsn = Product.objects(item_code=item["item_code"]).first().hsn
                    category = Product.objects(item_code=item["item_code"]).first().category
                    size = Product.objects(item_code=item["item_code"]).first().size
                    quantity = item["quantity"]
                    taxable_value = item["taxable_value"]
                    tax = item["tax"]
                    cost_price = item["cost_price"]

                    new_item = PurchaseItem(
                        item_desc = item_desc, 
                        item_code = item_code, 
                        hsn=hsn, category=category, 
                        size=size, 
                        quantity=quantity, 
                        taxable_value=taxable_value, 
                        tax=tax, 
                        cost_price=cost_price
                    )

                    items.append(new_item)

            invoice_number = invoice["invoice_number"]
            claim_invoice = invoice["claim_invoice"]
            claim_number = invoice["claim_number"]
            invoice_total = invoice["invoice_total"]

            purchase_invoice = Purchase(
                invoice_number = invoice_number, 
                claim_invoice = claim_invoice,
                claim_number = claim_number,
                invoice_total = invoice_total,
                items = items
                ).save()