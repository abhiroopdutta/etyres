#pip uninstall sql packages
from flask import Flask, render_template,jsonify, request, redirect, url_for, Response
from db import initialize_db
from update_price import update_price
from models import Product

app = Flask(__name__)
app.config['MONGODB_SETTINGS'] = {
    'db': 'etyresdb',
    'host': 'localhost',
    'port': 27017
}
initialize_db(app)

@app.route("/update_price", methods=['POST'])
def update_inventory():
    uploaded_file = request.files['file']
    if uploaded_file.filename != '':
        filepath = "./tempdata/"+uploaded_file.filename
        uploaded_file.save(filepath)
        update_price(filepath)
        return jsonify("we got it")
    return jsonify("we didn't get it")


@app.route("/data", methods = ['GET'])
def hello_world():
    products = Product.objects().to_json()
    return Response(products, mimetype="application/json", status=200)

