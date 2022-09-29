from flask import Flask,jsonify, request, Response
from flask import send_from_directory, abort
from db import initialize_db
from update_price import get_pv_price_details, update_price, load_to_db
from update_stock import read_invoices, update_stock, process_invoice
from create_order import create_order, compute_gst_tables, update_invoice_status
from sales_report import report_handler, reset_stock, get_sales_report
from account import add_header_item, add_transaction_item, get_filtered_transactions
from models import Header, Product, Purchase, Sale
from datetime import date, datetime
import os
import json

app = Flask(__name__)
app.config['MONGODB_SETTINGS'] = {
    'db': 'etyresdb',
    'host': os.environ['MONGODB_HOST'],
    #'host': 'localhost',
    'port': 27017
}
initialize_db(app)

app.config["CLIENT_CSV"] = "./tempdata/sales_report"

@app.route("/api/pv_price_details", methods = ['GET'])
def price_details():
    result = get_pv_price_details()
    return jsonify(result)

@app.route("/api/update_price", methods=['POST'])
def update_inventory():
    uploaded_file = request.files['file']
    price_details = json.loads(request.form["priceDetails"])
    if uploaded_file.filename != '':
        new_name = str(datetime.now()).replace(" ", "_")+uploaded_file.filename
        filepath = "./tempdata/"+new_name
        uploaded_file.save(filepath)
        update_price(price_details, filepath)
        return jsonify("Price List Updated")
    return jsonify("we didn't get it")

@app.route("/api/read_invoice", methods = ['POST'])
def invoice_status():
    if 'files[]' not in request.files:
            return jsonify("we didn't get it")

    files = request.files.getlist('files[]')
    dir = "./tempdata/update_stock/"+str(datetime.now()).replace(" ", "_")+"/"
    os.makedirs(dir)
    for file in files:
        if file:
            new_name = str(datetime.now()).replace(" ", "_")+file.filename
            filepath = dir+new_name
            file.save(filepath)

    invoices = read_invoices(dir)  
    return invoices, 200

@app.route("/api/process_invoice", methods = ['POST'])
def convert_to_normal_invoice():
    invoice = request.get_json()
    print(invoice)
    converted_invoice = process_invoice(**invoice)
    return converted_invoice, 200

@app.route("/api/update_stock", methods = ['POST'])
def update_purchase_stock():
    invoices = request.get_json()
    update_stock(invoices) 
    return jsonify("stock updated, invoice saved")

@app.route("/api/add_item", methods = ['POST'])
def add_item_to_inventory():
    item = request.get_json()
    status = load_to_db(**item) 
    if status == 0:
        return jsonify("success"), 200
    else:
        return jsonify("failure"), 400

@app.route("/api/get_gst_tables", methods = ['POST'])
def compute_table():
    data = request.get_json()
    result = compute_gst_tables(**data)
    return result, 200

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
    elif status == 3:
        return jsonify("Error! Item out of stock!", 400)

@app.route("/api/update_invoice_status", methods = ['POST'])
def invoice_status_update():
    invoice_status_request = request.get_json()
    status = update_invoice_status(invoice_status_request)
    if status == 0:
        return jsonify("Invoice status successfully updated"), 200
    elif status == 1:
        return jsonify("Error! Invoice not found in db"), 400
    elif status == 2:
        return jsonify("Selected status is same as previous, no status update applied"), 400
    elif status == 3:
        return jsonify("Error! Cannot change status of already cancelled invoice"), 400
    elif status == 4:
        return jsonify("Error! Cannot change status of invoice from paid to due"), 400     
    elif status == 5:
        return jsonify("Error! Product not found in inventory, invoice could not be cancelled"), 400     

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
        "tubeless_valve",
        "loose_tube/flaps_tube"
        ]).to_json()
    return Response(products, mimetype="application/json", status=200)

@app.route("/api/get_sales_invoice", methods = ['GET'])
def get_sale_invoice():
    invoice_number = request.args["invoiceNumber"]
    print(invoice_number)
    sales_invoice = Sale.objects(invoiceNumber=invoice_number).first().to_json()
    print(sales_invoice)
    return Response(sales_invoice, mimetype="application/json", status=200)

@app.route("/api/reset_stock", methods = ['GET'])
def stock_reset():
    status = reset_stock()
    return jsonify(status)

@app.route("/api/reports", methods = ['POST'])
def get_reports():
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

@app.route("/api/add_header", methods = ['POST'])
def add_header():
    data = request.get_json()
    add_header_item(**data)
    return jsonify("success"), 200

@app.route("/api/get_headers", methods = ['GET'])
def get_headers():
    headers = Header.objects().to_json()
    return Response(headers, mimetype="application/json", status=200)

@app.route("/api/add_transaction", methods = ['POST'])
def add_transaction():
    data = request.get_json()
    add_transaction_item(**data)
    return jsonify("success"), 200

@app.route("/api/get_transactions", methods = ['POST'])
def get_transactions():
    data = request.get_json()
    results = get_filtered_transactions(**data)
    return jsonify(results), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
