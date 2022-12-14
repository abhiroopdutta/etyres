from db import db
import datetime

class NoTaxItem(db.EmbeddedDocument):
    name = db.StringField(required=True)
    price = db.FloatField(required=True)
    quantity = db.IntField(required=True)

class NoTaxSale(db.Document):
    invoiceNumber = db.IntField(required=True, unique=True) 
    invoiceDate = db.DateTimeField(required=False, default=datetime.datetime.now)
    invoiceTotal = db.IntField(required=True)
    vehicleNumber = db.StringField(required=False)
    vehicleDesc = db.StringField(required=False)
    serviceItems = db.ListField(db.EmbeddedDocumentField(NoTaxItem))