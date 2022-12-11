import csv
import datetime
from models import Product, Purchase

#this function is designed to use only on the initial software setup 
#it takes a csv containing invoice number, invoice total and invoice date 
#and updates the invoice date in existing invoices(already stored in db)
def initial_setup():
    with open("./initial_setup/input.xls") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader: 
            invoice_number = str(row["Invoice No."]).strip()
            invoice_in_db = Purchase.objects(invoiceNumber = invoice_number).first()

            #only process this invoice if it exists in DB
            if(invoice_in_db):

                #cross check if invoice total of input file matches invoice total that exists in db
                invoice_total = float(str(row["Invoice Amt."]).replace(",", ""))
                if(invoice_in_db.invoiceTotal != invoice_total):
                    return (row["Invoice No."] + " " + row["Inv. Date"] + " invoice total not matching with existing invoice in db" 
                    + "\ninvoice total found in db: " + str(invoice_in_db.invoiceTotal) + " invoice total in input file: " + str(invoice_total))
                
                #update the invoicedate in existing invoice in db
                invoice_date = datetime.datetime.strptime(str(row["Inv. Date"]).strip() + " " + "11:30:00", '%m/%d/%Y %H:%M:%S')
                invoice_in_db.update(invoiceDate =  invoice_date)
                print("Invoice No. - " + row["Invoice No."] + "date successfully updated")
 
            #else report it to user that invoice hasn't been uploaded 
            else:
                return ("Invoice No. - " + row["Invoice No."] + " " + row["Inv. Date"] + " " + "invoice not found in db")
            
    return "success, invoice date updated"