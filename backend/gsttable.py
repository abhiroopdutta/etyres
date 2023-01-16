
def compute_gst_tables(products):
    GST_table = {
        "products":[],
        "total":{},
        "invoiceTotal": 0,
        "invoiceRoundOff":0.0
    }

    # calculate all column values for products(tyres, valves)
    for product in products:
        GST_product = {
            "itemDesc": product["itemDesc"],
            "itemCode": product["itemCode"],
            "HSN": product["HSN"],
            "quantity": int(product["quantity"]),
            "ratePerItem": 0.0,
            "taxableValue": 0.0,
            "CGST": 0.0,
            "CGSTAmount": 0.0,
            "SGST": 0.0,
            "SGSTAmount": 0.0,
            "IGST": 0.0,
            "IGSTAmount": 0.0,
            "value": 0.0,
        }

        if "ratePerItem" in product:
            GST_product["ratePerItem"] = product["ratePerItem"] 
        else:
            GST_product["ratePerItem"] = round(float(product["price"]) / (float(product["GST"]) + 1.0), 2)
        
        if "CGST" in product:
            GST_product["CGST"] = product["CGST"] 
        else:
            GST_product["CGST"] = round(float(product["GST"])/ 2.0, 2)

        if "SGST" in product:
            GST_product["SGST"] = product["SGST"] 
        else:
            GST_product["SGST"] = round(float(product["GST"])/ 2.0, 2)

        GST_product["taxableValue"] = round(GST_product["ratePerItem"] * GST_product["quantity"], 2)
        GST_product["CGSTAmount"] = round(GST_product["CGST"] * GST_product["taxableValue"], 2)
        GST_product["SGSTAmount"] = round(GST_product["SGST"] * GST_product["taxableValue"], 2)
        GST_product["value"] = round(GST_product["taxableValue"] + GST_product["CGSTAmount"] +  GST_product["SGSTAmount"], 2)
        GST_table["products"].append(GST_product)   

    GST_total = {
        "quantity" : 0,
        "taxableValue" : 0.0,
        "CGSTAmount" : 0.0,
        "SGSTAmount" : 0.0,
        "IGSTAmount": 0.0,
        "value" : 0.0,
    }
    for item in GST_table["products"]:
        GST_total["quantity"] += item["quantity"]
        GST_total["taxableValue"] += item["taxableValue"]
        GST_total["CGSTAmount"] += item["CGSTAmount"]
        GST_total["SGSTAmount"] += item["SGSTAmount"]
        GST_total["value"] += item["value"]

    GST_table["total"]["quantity"] = round(GST_total["quantity"], 2)
    GST_table["total"]["taxableValue"] = round(GST_total["taxableValue"], 2)
    GST_table["total"]["CGSTAmount"] = round(GST_total["CGSTAmount"], 2)
    GST_table["total"]["SGSTAmount"] = round(GST_total["SGSTAmount"], 2)
    GST_table["total"]["value"] = round(GST_total["value"], 2)

    GST_table["invoiceTotal"] = round(GST_total["value"])
    GST_table["invoiceRoundOff"] = round(round(GST_total["value"]) - GST_total["value"], 2)


    IGST_table = {
        "products":[],
        "total":{},
        "invoiceTotal": 0,
        "invoiceRoundOff":0.0
    }

    for product in products:
        IGST_product = {
            "itemDesc": product["itemDesc"],
            "itemCode": product["itemCode"],
            "HSN": product["HSN"],
            "quantity": int(product["quantity"]),
            "ratePerItem": 0.0,
            "taxableValue": 0.0,
            "CGST": 0.0,
            "CGSTAmount": 0.0,
            "SGST": 0.0,
            "SGSTAmount": 0.0,
            "IGST": 0.0,
            "IGSTAmount": 0.0,
            "value": 0.0,
        }

        if "ratePerItem" in product:
            IGST_product["ratePerItem"] = product["ratePerItem"] 
        else:
            IGST_product["ratePerItem"] = round(float(product["price"]) / (float(product["GST"]) + 1.0), 2)
        
        if "IGST" in product:
            IGST_product["IGST"] = product["IGST"] 
        else:
            IGST_product["IGST"] = round(float(product["GST"]), 2)

        IGST_product["taxableValue"] = round(IGST_product["ratePerItem"] * IGST_product["quantity"], 2)
        IGST_product["IGSTAmount"] = round(IGST_product["IGST"] * IGST_product["taxableValue"], 2)
        IGST_product["value"] = round(IGST_product["taxableValue"] + IGST_product["IGSTAmount"], 2)
        IGST_table["products"].append(IGST_product)  

    IGST_total = {
        "quantity" : 0,
        "taxableValue" : 0.0,
        "CGSTAmount" : 0.0,
        "SGSTAmount" : 0.0,
        "IGSTAmount": 0.0,
        "value" : 0.0,
    }

    for item in IGST_table["products"]:
        IGST_total["quantity"] += item["quantity"]
        IGST_total["taxableValue"] += item["taxableValue"]
        IGST_total["IGSTAmount"] += item["IGSTAmount"]
        IGST_total["value"] += item["value"]

    IGST_table["total"]["quantity"] = round(IGST_total["quantity"], 2)
    IGST_table["total"]["taxableValue"] = round(IGST_total["taxableValue"], 2)
    IGST_table["total"]["IGSTAmount"] = round(IGST_total["IGSTAmount"], 2)
    IGST_table["total"]["value"] = round(IGST_total["value"], 2)
    
    IGST_table["invoiceTotal"] = round(IGST_total["value"])
    IGST_table["invoiceRoundOff"] = round(round(IGST_total["value"]) - IGST_total["value"], 2) 

    return {"GST_table": GST_table,
            "IGST_table": IGST_table,
            }

