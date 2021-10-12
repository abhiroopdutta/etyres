from models import Sale
from mongoengine import Q
import datetime
import openpyxl
wb = openpyxl.Workbook() 

def sales_report(date_range):
    start = datetime.datetime.strptime(date_range["dateFrom"]+ " " + "05:30:00", '%Y-%m-%d %H:%M:%S')
    end = datetime.datetime.strptime(date_range["dateTo"]+ " " + "22:30:00", '%Y-%m-%d %H:%M:%S')
    invoices = Sale.objects((Q(invoiceDate__gte=start) & Q(invoiceDate__lte=end)))
    filepath = "./sales_report.xlsx"
    wb = openpyxl.Workbook() 
    sheet = wb.active
    for invoice in invoices:
        # for column in range(1, 10):
        #     sheet.cell(row=1, column=column).value
        print("invoice number", invoice.invoiceNumber)
        total_items = len(invoice.productItems) + len(invoice.serviceItems)
        # for i in range(1,total_items+1):
        #     sheet.cell(row=i, column = 1)


    wb.save(filepath)
    return "march.xls"