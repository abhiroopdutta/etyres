from enum import unique
from db import db
import datetime

class Product(db.Document):
    itemDesc = db.StringField(required=True)
    itemCode = db.StringField(required=True, unique=True)
    HSN = db.StringField(required=True)
    GST = db.FloatField(required=True)
    category = db.StringField(required=True)
    size = db.StringField(required=True)
    costPrice = db.FloatField(required=True)
    stock = db.IntField(required=True)

class PurchaseItem(db.EmbeddedDocument):
    itemDesc = db.StringField(required=True)
    itemCode = db.StringField(required=True)
    HSN = db.StringField(required=True)
    quantity = db.IntField(required=True)
    taxableValue = db.FloatField(required=True)
    tax = db.FloatField(required=True)
    itemTotal = db.FloatField(required=True)

# add special discount attribute
class ClaimItem(db.EmbeddedDocument):
    itemDesc = db.StringField(required=True)
    itemCode = db.StringField(required=True)
    claimNumber = db.IntField(required=True)
 
class Purchase(db.Document):
    invoiceNumber = db.IntField(required=True, unique=True)
    invoiceDate = db.DateTimeField(required=True, default=datetime.datetime.now) 
    specialDiscount = db.StringField(required=True)  
    claimInvoice = db.BooleanField(Required=True)
    claimItems = db.ListField(db.EmbeddedDocumentField(ClaimItem))
    invoiceTotal = db.FloatField(required=True)
    items = db.ListField(db.EmbeddedDocumentField(PurchaseItem))

class CustomerDetail(db.EmbeddedDocument):
    name = db.StringField()
    address = db.StringField()
    GSTIN = db.StringField()
    stateCode = db.StringField()
    state = db.StringField()
    vehicleNumber = db.StringField()
    contact = db.StringField()

class ProductItem(db.EmbeddedDocument):
    itemDesc = db.StringField(required=True)
    itemCode = db.StringField(required=True)
    HSN = db.StringField(required=True)
    costPrice = db.FloatField(required=True)
    ratePerItem = db.FloatField(required=True)
    quantity = db.IntField(required=True)
    CGST = db.FloatField(required=True)
    SGST = db.FloatField(required=True)
    IGST = db.FloatField(required=True)

class ServiceItem(db.EmbeddedDocument):
    name = db.StringField(required=True)
    HSN = db.StringField(required=True)
    ratePerItem = db.FloatField(required=True)
    quantity = db.IntField(required=True)
    CGST = db.FloatField(required=True)
    SGST = db.FloatField(required=True)

class Sale(db.Document):
    invoiceNumber = db.IntField(required=True, unique=True) 
    invoiceDate = db.DateTimeField(required=True, default=datetime.datetime.now)
    invoiceStatus = db.StringField(required=True)
    invoiceTotal = db.IntField(required=True)
    invoiceRoundOff = db.FloatField(required=True)
    customerDetails = db.EmbeddedDocumentField(CustomerDetail)
    productItems =  db.ListField(db.EmbeddedDocumentField(ProductItem))
    serviceItems = db.ListField(db.EmbeddedDocumentField(ServiceItem))