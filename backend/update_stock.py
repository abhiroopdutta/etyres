import csv	
from models import Product
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
            #we wont be storing invoice round off value
            invoice_roundOff = 0

            for i, row in enumerate(reader):
                if(i>0):
                    invoice_number = str(row[0])
                    items.append({
                        "item_code":str(row[2]), 
                        "quantity":int(row[4]),
                        "taxable_val":float(row[5].replace(",", "")),
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

            invoices.append({
                "invoice_number":invoice_number,
                "claim_invoice":False,
                "overwrite_price_list":False,
                "items":items,
                "invoice_total":invoice_total,
                "price_list_tally":price_list_tally
            })

        os.remove(file)

        # for item in items:
        #     oldstock = Product.objects(item_code=item.item_code).first.stock
        #     new_stock = oldstock + item["quantity"]
        #     if(overwrite_price_list):
        #         Product.objects(item_code=item["item_code"]).first().update(stock=new_stock, cost_price=item.cost_price)
        #     else:
        #         Product.objects(item_code=item["item_code"]).first().update(stock=new_stock)

    return invoices