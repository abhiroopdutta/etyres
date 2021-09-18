from db import db

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
    quantity = db.IntField(required=True)
    taxable_value = db.FloatField(required=True)
    tax = db.FloatField(required=True)
    total = db.FloatField(required=True)
    hsn = db.StringField(required=True)
    category = db.StringField(required=True)
    size = db.StringField(required=True)

class Purchase(db.Document):
    invoice_no = db.StringField(required=True)
    invoice_date = db.DateTimeField(required=True)    
    claim_invoice = db.BooleanField(Required=True)
    items = db.ListField(db.EmbeddedDocumentField(PurchaseItem))
    invoice_total = db.FloatField(required=True)
    invoice_roundOff = db.FloatField(required=True)