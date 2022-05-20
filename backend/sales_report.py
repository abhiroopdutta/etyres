from unittest import result
from openpyxl.worksheet import worksheet
from models import Purchase, Sale, Product
from mongoengine import Q
import datetime
import openpyxl
import os
from openpyxl.styles import Border, Side, PatternFill, Font
wb = openpyxl.Workbook() 

def get_sales_report(filters = {}, sorters = {}, pageRequest = 1, maxItemsPerPage = 5):
    results = {
        "data": [],
        "pagination": { 
            "pageNumber": 0, 
            "pageSize": 0, 
            "totalResults" : 0 }
        
    }
    page_start = (pageRequest-1)*maxItemsPerPage
    page_end = pageRequest*maxItemsPerPage
    query = Q(invoiceNumber__gte=0) # dummy query
    
    if (filters["invoiceNumber"].isnumeric()):
        query &= Q(invoiceNumber=int(filters["invoiceNumber"]))
    if (filters["customerName"]):
        query &= Q(customerDetails__name__contains=filters["customerName"])
    if (filters["invoiceDate"]["start"] and filters["invoiceDate"]["end"]):
        start_datetime = datetime.datetime.strptime(filters["invoiceDate"]["start"] + " " + "05:30:00", '%Y-%m-%d %H:%M:%S')
        end_datetime = datetime.datetime.strptime(filters["invoiceDate"]["end"] + " " + "22:30:00", '%Y-%m-%d %H:%M:%S')
        query &= Q(invoiceDate__gte=start_datetime) & Q(invoiceDate__lte=end_datetime)

    results["data"] = Sale.objects(query).order_by('-_id')[page_start:page_end]
    results["pagination"]["totalResults"] = Sale.objects(query).order_by('-_id')[page_start:page_end].count()
    results["pagination"]["pageNumber"] = pageRequest
    results["pagination"]["pageSize"] = len(results["data"])
    return results

def report_handler(report_req_info):
    os.makedirs("./tempdata/sales_report/", exist_ok = True) #make the dir if it doesn't exist
    if report_req_info["reportType"] == "stock":
        start = datetime.datetime.strptime(report_req_info["dateFrom"]+ " " + "05:30:00", '%Y-%m-%d %H:%M:%S')
        return stock_report(start)
    elif report_req_info["reportType"] == "sale":
        results = get_sales_report(report_req_info["filters"], {}, 1, 10000)
        return sales_report(results["data"])
    elif report_req_info["reportType"] == "purchase":
        start = datetime.datetime.strptime(report_req_info["dateFrom"]+ " " + "05:30:00", '%Y-%m-%d %H:%M:%S')
        end = datetime.datetime.strptime(report_req_info["dateTo"]+ " " + "22:30:00", '%Y-%m-%d %H:%M:%S')
        return purchase_report(start, end)

def sales_report(invoices):  
    file_base_dir = "./tempdata/sales_report/"
    filename = str(datetime.datetime.now())+"sales_report.xlsx"
    wb = openpyxl.Workbook() 
    sheet = wb.active
    sheet.freeze_panes = 'A2'

    column_headers = ["Invoice No.", "Invoice Date", "Item Description", "HSN", "Rate per Item", "Qty", "Taxable Val", "CGST Rate", "CGST Amt", "SGST Rate", "SGST Amt", "IGST Rate", "IGST Amt", "Total", "Customer Name", "GSTIN"]
    
    #Aplly style to header row
    sheet.row_dimensions[1].fill = PatternFill("solid", fgColor="b4f05c")
    sheet.row_dimensions[1].border = Border(left=Side(border_style="thin"),right=Side(border_style="thin"),top=Side(border_style="thin"),bottom=Side(border_style="thin"))
    sheet.row_dimensions[1].font = Font(name="Calibri", bold=True)

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
    
    #apply styles to final row
    sheet.row_dimensions[total_row_index+1].fill = PatternFill("solid", fgColor="b4f05c")
    sheet.row_dimensions[total_row_index+1].border = Border(left=Side(border_style="thin"),right=Side(border_style="thin"),top=Side(border_style="thin"),bottom=Side(border_style="thin"))
    sheet.row_dimensions[total_row_index+1].font = Font(name="Calibri", bold=True)
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

        #this adjusts the font and column width of the whole sheet
    dims = {}
    for row in sheet.rows:
        for cell in row:
            if cell.value:
                dims[cell.column_letter] = max((dims.get(cell.column_letter, 0), (len(str(cell.value)))*1.2))    
    for col, value in dims.items():
        sheet.column_dimensions[col].width = value
    ####

    wb.save(file_base_dir+filename)
    return filename

def purchase_report(start, end):
    purchases = Purchase.objects((Q(invoiceDate__gte=start) & Q(invoiceDate__lte=end)))
    file_base_dir = "./tempdata/sales_report/"
    filename = str(datetime.datetime.now())+"purchase_report.xlsx"
    wb = openpyxl.Workbook() 
    sheet = wb.active

    sheet.freeze_panes = 'A2'

    column_headers = ["Invoice No.", "Invoice Date", "Claim Invoice", "Item Description", "Item Code", "HSN", "Qty", "Taxable Val", "Tax", "Total"]
    
    #Aplly style to header row
    sheet.row_dimensions[1].fill = PatternFill("solid", fgColor="C5C5C5")
    sheet.row_dimensions[1].border = Border(left=Side(border_style="thin"),right=Side(border_style="thin"),top=Side(border_style="thin"),bottom=Side(border_style="thin"))
    sheet.row_dimensions[1].font = Font(name="Calibri", bold=True)

    for i, column_header in enumerate(column_headers):
        sheet.cell(row=1, column=i+1).value = column_header

    #find a better way to do the following, instead of using base index, use sheet.max_row ?
    base_index = 0
    for invoice in purchases:
        total_items = len(invoice.items)
        for i, product in enumerate(invoice.items):
            row_index = i+2+base_index
            sheet.cell(row = row_index, column = 1).value = invoice.invoiceNumber
            sheet.cell(row = row_index, column = 2).value = invoice.invoiceDate.strftime("%d/%m/%Y")
            sheet.cell(row = row_index, column = 3).value = "No" if invoice.claimInvoice ==0 else "Yes"
            sheet.cell(row = row_index, column = 4).value = product.itemDesc
            sheet.cell(row = row_index, column = 5).value = product.itemCode
            sheet.cell(row = row_index, column = 6).value = product.HSN
            sheet.cell(row = row_index, column = 7).value = product.quantity
            sheet.cell(row = row_index, column = 8).value = product.taxableValue
            sheet.cell(row = row_index, column = 9).value = product.tax
            sheet.cell(row = row_index, column = 10).value = product.itemTotal
        base_index += total_items

    total_row_index = sheet.max_row
    
    #apply styles to final row
    sheet.row_dimensions[total_row_index+1].fill = PatternFill("solid", fgColor="C5C5C5")
    sheet.row_dimensions[total_row_index+1].border = Border(left=Side(border_style="thin"),right=Side(border_style="thin"),top=Side(border_style="thin"),bottom=Side(border_style="thin"))
    sheet.row_dimensions[total_row_index+1].font = Font(name="Calibri", bold=True)
    # total row label
    sheet.cell(row=total_row_index+1, column=2).value = "TOTAL"
    # total quantity
    total_quantity = '= SUM(G2:G'+str(total_row_index)+')'
    sheet.cell(row=total_row_index+1, column=7).value = total_quantity
    # total taxable val
    total_taxable_val = '= SUM(H2:H'+str(total_row_index)+')'
    sheet.cell(row=total_row_index+1, column=8).value = total_taxable_val
    # total CGST
    total_tax = '= SUM(I2:I'+str(total_row_index)+')'
    sheet.cell(row=total_row_index+1, column=9).value = total_tax
    # total 
    total = '= SUM(J2:J'+str(total_row_index)+')'
    sheet.cell(row=total_row_index+1, column=10).value = total

    #this adjusts the font and column width of the whole sheet
    dims = {}
    for row in sheet.rows:
        for cell in row:
            if cell.value:
                dims[cell.column_letter] = max((dims.get(cell.column_letter, 0), (len(str(cell.value))+1)*1.2))    
    for col, value in dims.items():
        sheet.column_dimensions[col].width = value
    ####

    wb.save(file_base_dir+filename)
    return filename

def stock_report(start):
    category_required_list = [
    "passenger_car_tyre", 
    "passenger_car_tube", 
    "2_wheeler_tyre",
    "2_wheeler_tube",
    "3_wheeler_tyre",
    "3_wheeler_tube",
    "scv_tyre",
    "scv_tube",
    "tubeless_valve"
    ]
    products = Product.objects(Q(category__in=category_required_list)&Q(stock__ne=0))
    file_base_dir = "./tempdata/sales_report/"
    filename = str(datetime.datetime.now())+"stock_report.xlsx"
    wb = openpyxl.Workbook() 
    sheet = wb.active

    sheet.freeze_panes = 'A2'
    column_headers = ["Item Description", "Item Code", "Cost Price", "Stock"]
    
    #Aplly style to header row
    sheet.row_dimensions[1].fill = PatternFill("solid", fgColor="fcfa8e")
    sheet.row_dimensions[1].border = Border(left=Side(border_style="thin"),right=Side(border_style="thin"),top=Side(border_style="thin"),bottom=Side(border_style="thin"))
    sheet.row_dimensions[1].font = Font(bold=True)

    for i, column_header in enumerate(column_headers):
        sheet.cell(row=1, column=i+1).value = column_header

    for i, product in enumerate(products):
        sheet.cell(row = i+2, column = 1).value = product.itemDesc
        sheet.cell(row = i+2, column = 2).value = product.itemCode
        sheet.cell(row = i+2, column = 3).value = product.costPrice
        sheet.cell(row = i+2, column = 4).value = product.stock


    #this adjusts the font and column width of the whole sheet
    dims = {}
    for row in sheet.rows:
        for cell in row:
            if cell.value:
                dims[cell.column_letter] = max((dims.get(cell.column_letter, 0), (len(str(cell.value))+0)*1.2))    
    for col, value in dims.items():
        sheet.column_dimensions[col].width = value
    ####

    wb.save(file_base_dir+filename)
    return filename

def reset_stock():
    for product in Product.objects(stock__ne=0):
        product.update(stock = 0)

    for invoice in Purchase.objects:
        for product in invoice.items:
            product_found = Product.objects(itemCode=product.itemCode).first()
            if product_found is None:
                print("Item not found in Product table: ", product.itemDesc, product.itemCode)
                return False
            new_stock = product_found.stock + product.quantity
            Product.objects(itemCode=product.itemCode).first().update(stock=new_stock) 
    
    for invoice in Sale.objects:
        for product in invoice.productItems:
            product_found = Product.objects(itemCode=product.itemCode).first()
            if product_found is None:
                print("Item not found in Product table: ", product.itemDesc, product.itemCode)
                return False
            new_stock = product_found.stock - product.quantity
            Product.objects(itemCode=product.itemCode).first().update(stock=new_stock) 
    return True