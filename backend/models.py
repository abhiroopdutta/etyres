from db import db

class Product(db.Document):
    item_desc = db.StringField(required=True)
    item_code = db.StringField(required=True)
    hsn = db.StringField(required=True)
    category = db.StringField(required=True)
    size = db.StringField(required=True)
    cost_price = db.FloatField(required=True)
    stock = db.IntField(required=True)