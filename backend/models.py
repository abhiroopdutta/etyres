from db import db
import datetime

class Product(db.Document):
    item_desc = db.StringField(required=True)
    item_code = db.StringField(required=True)
    hsn = db.StringField(required=True)
    category = db.StringField(required=True)
    size = db.StringField(required=True)
    cost_price = db.FloatField(required=True)
    stock = db.IntField(required=True)

class PurchaseItem(db.EmbeddedDocument):
    item_desc = db.StringField(required=True)
    item_code = db.StringField(required=True)
    hsn = db.StringField(required=True)
    category = db.StringField(required=True)
    size = db.StringField(required=True)
    quantity = db.IntField(required=True)
    taxable_value = db.FloatField(required=True)
    tax = db.FloatField(required=True)
    cost_price = db.FloatField(required=True)
 
class Purchase(db.Document):
    invoice_number = db.StringField(required=True)
    invoice_date = db.DateTimeField(required=True, default=datetime.datetime.utcnow)    
    claim_invoice = db.BooleanField(Required=True)
    claim_number = db.StringField(required=True)
    invoice_total = db.FloatField(required=True)
    items = db.ListField(db.EmbeddedDocumentField(PurchaseItem))

    
