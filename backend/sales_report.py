from models import Sale
from mongoengine import Q
import datetime
import openpyxl
wb = openpyxl.Workbook() 

def sales_report(date_range):
    start = datetime.datetime.strptime(date_range["dateFrom"]+ " " + "05:30:00", '%Y-%m-%d %H:%M:%S')
    end = datetime.datetime.strptime(date_range["dateTo"]+ " " + "22:30:00", '%Y-%m-%d %H:%M:%S')
    invoices = Sale.objects((Q(invoiceDate__gte=start) & Q(invoiceDate__lte=end)))
    file_base_dir = "./tempdata/sales_report/"
    filename = str(datetime.datetime.now())+"sales_report.xlsx"
    wb = openpyxl.Workbook() 
    sheet = wb.active
    column_headers = ["Invoice No.", "Invoice Date", "Item Description", "HSN", "Rate per Item", "Qty", "Taxable Val", "CGST Rate", "CGST Amt", "SGST Rate", "SGST Amt", "IGST Rate", "IGST Amt", "Total", "Customer Name", "GSTIN"]
    for i, column_header in enumerate(column_headers):
        sheet.cell(row=1, column=i+1).value = column_header

    #find a better way to do the following, instead of using base index, use sheet.max_row ?
    base_index = 0
    for invoice in invoices:
        total_items = len(invoice.productItems) + len(invoice.serviceItems)
        for i, product in enumerate(invoice.productItems):
            row_index = i+2+base_index
            sheet.cell(row = row_index, column = 1).value = invoice.invoiceNumber
            sheet.cell(row = row_index, column = 2).value = invoice.invoiceDate.strftime("%d/%m/%Y")
            sheet.cell(row = row_index, column = 3).value = product.itemDesc
            sheet.cell(row = row_index, column = 4).value = product.HSN
            sheet.cell(row = row_index, column = 5).value = product.ratePerItem
            sheet.cell(row = row_index, column = 6).value = product.quantity
            taxable_val = round((float(product.quantity)*float(product.ratePerItem)),2)
            CGST = round((float(product.CGST)*taxable_val),2)
            SGST = round((float(product.SGST)*taxable_val),2)
            IGST = round((float(product.IGST)*taxable_val),2)
            total = taxable_val + SGST + CGST + IGST
            sheet.cell(row = row_index, column = 7).value = taxable_val
            sheet.cell(row = row_index, column = 8).value = str(round(product.CGST*100,2))+"%"
            sheet.cell(row = row_index, column = 9).value = CGST
            sheet.cell(row = row_index, column = 10).value = str(round(product.SGST*100,2))+"%"
            sheet.cell(row = row_index, column = 11).value = SGST
            sheet.cell(row = row_index, column = 12).value = str(round(product.IGST*100,2))+"%"
            sheet.cell(row = row_index, column = 13).value = IGST
            sheet.cell(row = row_index, column = 14).value = total
            sheet.cell(row = row_index, column = 15).value = invoice.customerDetails.name
            sheet.cell(row = row_index, column = 16).value = invoice.customerDetails.GSTIN
            
        for i, service in enumerate(invoice.serviceItems):
            row_index = i+2+base_index+len(invoice.productItems)
            sheet.cell(row = row_index, column = 1).value = invoice.invoiceNumber
            sheet.cell(row = row_index, column = 2).value = invoice.invoiceDate.strftime("%d/%m/%Y")
            sheet.cell(row = row_index, column = 3).value = service.name
            sheet.cell(row = row_index, column = 4).value = service.HSN
            sheet.cell(row = row_index, column = 5).value = service.ratePerItem
            sheet.cell(row = row_index, column = 6).value = service.quantity
            taxable_val = round((float(service.quantity)*float(service.ratePerItem)),2)
            CGST = round((float(service.CGST)*taxable_val),2)
            SGST = round((float(service.SGST)*taxable_val),2)
            IGST = 0
            total = taxable_val + SGST + CGST + IGST
            sheet.cell(row = row_index, column = 7).value = taxable_val
            sheet.cell(row = row_index, column = 8).value = str(round(service.CGST*100,2))+"%"
            sheet.cell(row = row_index, column = 9).value = CGST
            sheet.cell(row = row_index, column = 10).value = str(round(service.SGST*100,2))+"%"
            sheet.cell(row = row_index, column = 11).value = SGST
            sheet.cell(row = row_index, column = 12).value = "0.0%"
            sheet.cell(row = row_index, column = 13).value = IGST
            sheet.cell(row = row_index, column = 14).value = total
            sheet.cell(row = row_index, column = 15).value = invoice.customerDetails.name
            sheet.cell(row = row_index, column = 16).value = invoice.customerDetails.GSTIN


        base_index += total_items

    total_row_index = sheet.max_row
    
    # total row label
    sheet.cell(row=total_row_index+1, column=2).value = "TOTAL"
    # total quantity
    total_quantity = '= SUM(F2:F'+str(total_row_index)+')'
    sheet.cell(row=total_row_index+1, column=6).value = total_quantity
    # total taxable val
    total_taxable_val = '= SUM(G2:G'+str(total_row_index)+')'
    sheet.cell(row=total_row_index+1, column=7).value = total_taxable_val
    # total CGST
    total_CGST = '= SUM(I2:I'+str(total_row_index)+')'
    sheet.cell(row=total_row_index+1, column=9).value = total_CGST
    # total SGST
    total_SGST = '= SUM(K2:K'+str(total_row_index)+')'
    sheet.cell(row=total_row_index+1, column=11).value = total_SGST
    # total IGST
    total_IGST = '= SUM(M2:M'+str(total_row_index)+')'
    sheet.cell(row=total_row_index+1, column=13).value = total_IGST
    # total 
    total = '= SUM(N2:N'+str(total_row_index)+')'
    sheet.cell(row=total_row_index+1, column=14).value = total

    wb.save(file_base_dir+filename)
    return filename