from flask import Flask,jsonify, request, Response
from flask import send_from_directory, abort
from db import initialize_db
from update_price import load_to_db
from create_order import compute_gst_tables
from reports import report_handler, reset_stock
from models import Product
from datetime import datetime
import os
from routes import initialize_api
from services.purchase import purchase_service

app = Flask(__name__)
app.config["API_TITLE"] = "ETyres API"
app.config["API_VERSION"] = "v1"
app.config["OPENAPI_VERSION"] = "3.0.2"
app.config["OPENAPI_URL_PREFIX"] = "/"
app.config["OPENAPI_SWAGGER_UI_PATH"] = "/swagger-ui"
app.config["OPENAPI_SWAGGER_UI_URL"] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"
app.config['MONGODB_SETTINGS'] = {
    'db': 'etyresdb',
    'host': os.environ['MONGODB_HOST'],
    #'host': 'localhost',
    'port': 27017
}

initialize_api(app)
initialize_db(app)

app.config["CLIENT_CSV"] = "./tempdata/sales_report"

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

    invoices = purchase_service.read_invoices(dir)  
    return invoices, 200

@app.route("/api/process_invoice", methods = ['POST'])
def convert_to_normal_invoice():
    invoice = request.get_json()
    converted_invoice = purchase_service.process_invoice(**invoice)
    return converted_invoice, 200

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
   
@app.route("/api/data", methods = ['GET'])
def hello_world():
    products = Product.objects().to_json()
    return Response(products, mimetype="application/json", status=200)

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
