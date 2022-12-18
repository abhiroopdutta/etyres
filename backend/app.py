from flask import Flask,jsonify, request
from db import initialize_db
from create_order import compute_gst_tables
from reports import reset_stock
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

@app.route("/api/get_gst_tables", methods = ['POST'])
def compute_table():
    data = request.get_json()
    result = compute_gst_tables(**data)
    return result, 200
   
@app.route("/api/reset_stock", methods = ['GET'])
def stock_reset():
    status = reset_stock()
    return jsonify(status)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
