import csv	
from models import ClaimItem, Product, Purchase, ProductItem, SupplierDetail, Supplier, PurchasePayment
import glob, os
import datetime
from itertools import repeat
from flask import jsonify
from mongoengine import Q
from services.transaction import transaction_service
from services.supplier import supplier_service

class PurchaseService():
    def read_purchase_file(self, file):
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
    def process_invoice(self, invoice_number, items):
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

    def read_invoices(self, directory):
        invoices = []
        invoices_already_exist = []
        invoices_with_new_products = []
        files = glob.glob(directory + "*.xls")
        for file in files:

            invoice = self.read_purchase_file(file)
            processed_invoice = self.process_invoice(**invoice)
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

    def create_invoices(self, invoices):
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
                supplier_service.create_supplier(GSTIN=supplier_details.GSTIN, name=supplier_details.name)

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

    def get_invoices(
        self,
        invoiceNumber= "",
        start= "",
        end= "",
        invoiceStatus= "",
        supplierName = "",
        supplierGSTIN = "",
        claimInvoice= "",
        page= 1,
        page_size= 5,
    ):
        results = {
            "data": [],
            "count": 0
        }
        page_start = (page-1)*page_size
        page_end = page*page_size
        query = Q() # dummy query
        
        if (invoiceNumber):
            query &= Q(invoiceNumber=invoiceNumber)
        if (invoiceStatus):
            query &= Q(invoiceStatus__in=invoiceStatus)
        if (supplierName):
            query &= Q(supplierDetails__name__icontains=supplierName)
        if (supplierGSTIN):
            query &= Q(supplierDetails__GSTIN__icontains=supplierGSTIN)      
        if (claimInvoice):
            if (claimInvoice == "true"):
                query &= Q(claimInvoice=True)
            else:
                query &= Q(claimInvoice=False)
        if (start and end):
            start_datetime = datetime.datetime.strptime(start[:10] + " " + "00:00:00", '%Y-%m-%d %H:%M:%S')
            end_datetime = datetime.datetime.strptime(end[:10] + " " + "23:59:59", '%Y-%m-%d %H:%M:%S')
            query &= Q(invoiceDate__gte=start_datetime) & Q(invoiceDate__lte=end_datetime)

        results["data"] = Purchase.objects(query).order_by('-invoiceDate')[page_start:page_end]
        results["count"] = Purchase.objects(query).count()
        return results

    def update_invoice(self, invoice_number, invoice_status, payment):
        invoice = Purchase.objects(invoiceNumber = invoice_number).first()
        if invoice is None:
            print(f'Trying to update status of invoice No. : {invoice_number} that does not exist in db')
            return (jsonify("Error! Invoice not found in db"), 400)

        old_invoice_status = invoice.invoiceStatus
        new_invoice_status = invoice_status

        # cannot change status of cancelled invoices
        if old_invoice_status == "cancelled":
            print(f'Error! Cannot change status of invoice No. : {invoice_number} that is already cancelled')
            return (jsonify("Error! Cannot change status of already cancelled invoice"), 400)
        # cannot change status of paid invoices to paid/due
        if old_invoice_status == "paid" and (new_invoice_status in ["paid", "due"]):
            print(f'Error! Cannot change status of invoice No. : {invoice_number} from paid to due/paid')
            return (jsonify("Error! Cannot change status of invoice from paid to due"), 400)     

        # only 2 types of status changes are possible

        # 1. due -> paid/due
        if old_invoice_status == "due" and (new_invoice_status in ["paid", "due"]):
            new_payment = payment
            old_payment = invoice.payment

            diff_payment = {
            }
            for paymentMethod in old_payment:
                diff_payment[paymentMethod] = new_payment[paymentMethod] - old_payment[paymentMethod]
            
            # no change in payment
            if (all(value == 0 for value in diff_payment.values())):
                return jsonify("Payment is same as previous, no change applied"), 400

            # any value has decreased
            if (any(value < 0 for value in diff_payment.values())):
                return jsonify("Payment is less than previous, no change applied"), 400
            
            invoice.update(invoiceStatus = new_invoice_status, payment = new_payment)
            for paymentMethod, paymentAmount in diff_payment.items():
                if paymentMethod == "creditNote":
                    transactionFrom = "04"
                    paymentMode = "creditNote"
                elif paymentMethod == "cash":
                    transactionFrom = "00"
                    paymentMode = "cash"
                elif paymentMethod == "bank":
                    transactionFrom = "01"
                    paymentMode = "bankTransfer"

                if paymentAmount > 0 :
                    transaction_service.create_transaction(
                        transactionFrom = transactionFrom,
                        transactionTo = "02",
                        dateTime = datetime.datetime.now(),
                        status = "paid",
                        paymentMode = paymentMode,
                        amount = paymentAmount,
                        reference_id = invoice.invoiceNumber,
                    )

        # In case of cancellations, reverse the stock also
        # 2. due/paid -> cancelled
        elif old_invoice_status in ["due", "paid"] and new_invoice_status == "cancelled":

            if invoice.items:
                # first check if each product exists in inventory
                for product in invoice.items:
                    productFound = Product.objects(itemCode = product.itemCode).first()
                    if productFound is None:
                        print(f'Error! {product["itemDesc"]}: {product["itemCode"]} not found in inventory while reversing stock, invoice could not be cancelled')
                        return (jsonify("Error! Product not found in inventory, invoice could not be cancelled"), 400 )    

                # if each product exists in inventory, only then proceed to reverse stock for each product
                for product in invoice.items:
                    productFound = Product.objects(itemCode = product.itemCode).first()
                    oldstock = productFound.stock
                    new_stock = oldstock - product.quantity
                    Product.objects(itemCode=product["itemCode"]).first().update(stock=new_stock)

            invoice.update(invoiceStatus = new_invoice_status)
            for paymentMethod in invoice.payment:
                if paymentMethod == "creditNote":
                    transactionTo = "04"
                    paymentMode = "creditNote"
                elif paymentMethod == "cash":
                    transactionTo = "00"
                    paymentMode = "cash"
                elif paymentMethod == "bank":
                    transactionTo = "01"
                    paymentMode = "bankTransfer"

                if invoice.payment[paymentMethod] > 0 :
                    transaction_service.create_transaction(
                        transactionFrom = "02",
                        transactionTo = transactionTo,
                        dateTime = datetime.datetime.now(),
                        status = "paid",
                        paymentMode = paymentMode,
                        amount = invoice.payment[paymentMethod],
                        reference_id = invoice.invoiceNumber,
                    )

        return (jsonify("Invoice status successfully updated"), 200)
        

purchase_service = PurchaseService()