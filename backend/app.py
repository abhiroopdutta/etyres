#pip uninstall sql packages
from flask import Flask, render_template,jsonify, request, redirect, url_for
from flask_mongoengine import MongoEngine

app = Flask(__name__)
app.config['MONGODB_SETTINGS'] = {
    'db': 'etyresdb',
    'host': 'localhost',
    'port': 27017
}
db = MongoEngine()
db.init_app(app)

class Product(db.Document):
    item_description = db.StringField(required=True)
    item_code = db.StringField(required=True)
    ndp = db.FloatField()
    frt = db.FloatField()
    spd = db.FloatField()
    plsd = db.FloatField()
    tax_val = db.FloatField()
    gst = db.FloatField()
    total = db.FloatField()
    stock = db.IntField()

@app.route("/update_price", methods=['POST'])
def update_price():
    uploaded_file = request.files['file']
    if uploaded_file.filename != '':
        uploaded_file.save(uploaded_file.filename)
        return jsonify("we got it")
    return jsonify("hello")


@app.route("/data", methods = ['GET'])
def hello_world():
   return jsonify("hello")

