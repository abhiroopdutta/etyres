#pip uninstall sql packages
from flask import Flask, render_template,jsonify, request, redirect, url_for, Response
from flask import send_from_directory, abort

from db import initialize_db
from update_price import update_price
from update_stock import read_invoice, update_stock
from create_order import create_order
from sales_report import report_handler, reset_stock
from models import Product, Purchase, Sale
from datetime import date, datetime
import os

app = Flask(__name__)
app.config['MONGODB_SETTINGS'] = {
    'db': 'etyresdb',
    'host': os.environ['MONGODB_HOST'],
    #'host': 'localhost',
    'port': 27017
}
initialize_db(app)

app.config["CLIENT_CSV"] = "./tempdata/sales_report"

@app.route("/api/update_price", methods=['POST'])
def update_inventory():
    uploaded_file = request.files['file']
    if uploaded_file.filename != '':
        new_name = str(datetime.now()).replace(" ", "_")+uploaded_file.filename
        filepath = "./tempdata/"+new_name
        uploaded_file.save(filepath)
        update_price(filepath)
        return jsonify("Price List Updated")
    return jsonify("we didn't get it")

@app.route("/api/read_invoice", methods = ['POST'])
def invoice_status():
    if 'files[]' not in request.files:
            return jsonify("we didn't get it")

    files = request.files.getlist('files[]')
    dir = "./tempdata/update_stock/"+str(datetime.now()).replace(" ", "_")+"/"
    os.mkdir(dir)
    for file in files:
        if file:
            new_name = str(datetime.now()).replace(" ", "_")+file.filename
            filepath = dir+new_name
            file.save(filepath)

    invoices = read_invoice(dir)  
    return jsonify(invoices)

@app.route("/api/update_stock", methods = ['POST'])
def process_invoice():

    invoices = request.get_json()
    update_stock(invoices) 
    return jsonify("stock updated, invoice saved")

@app.route("/api/place_order", methods = ['POST'])
def stock_out():
    invoice = request.get_json()
    status = create_order(invoice)
    if status == 0:
        return jsonify("stock updated, invoice saved"), 200
    elif status == 1:
        return jsonify("Error! invoice is empty"), 400
    elif status == 2:
        return jsonify("Error! invoice date selected is older than previous invoice date"), 400

@app.route("/api/sales_invoice_number", methods = ['GET'])
def sales_invoice_number():
    previous_invoice = Sale.objects().order_by('-_id').first()
    if(previous_invoice is None):
        invoice_number = 1
    else:
        invoice_number = previous_invoice.invoiceNumber + 1
    return jsonify(invoice_number)

@app.route("/api/data", methods = ['GET'])
def hello_world():
    products = Product.objects(category__in=[
        "passenger_car_tyre", 
        "passenger_car_tube", 
        "2_wheeler_tyre",
        "2_wheeler_tube",
        "3_wheeler_tyre",
        "3_wheeler_tube",
        "scv_tyre",
        "scv_tube",
        "tubeless_valve"
        ]).to_json()
    return Response(products, mimetype="application/json", status=200)

@app.route("/api/reset_stock", methods = ['GET'])
def stock_reset():
    status = reset_stock()
    return jsonify(status)

@app.route("/api/sales_report", methods = ['POST'])
def sales_report_excel():
    report_req_info = request.get_json()
    filename = report_handler(report_req_info)
    return jsonify(filename)

@app.route("/api/download", methods = ['GET'])
def download():
    filename = request.args["name"]
    try:
        return send_from_directory(app.config["CLIENT_CSV"], filename, as_attachment=True)
    except FileNotFoundError:
        abort(404)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
