import openpyxl
import re, os
from models import Product

pv_vehicle_type = {
	"passenger car":{"tyre_freight":20, "tube_freight":3, "spd":0.015, "plsd":0.025}, 
	"2 wheeler":{"tyre_freight":6, "tube_freight":3, "spd":0.015, "plsd":0.025}, 
	"3 wheeler":{"tyre_freight":8, "tube_freight":3, "spd":0.014, "plsd":0.025},
	"scv":{"tyre_freight":40, "tube_freight":5, "spd":0.014, "plsd":0.025},
	"tubeless valve":{ "valve_freight":0, "spd":0.0, "plsd":0.0}
	}
other_vehicle_type = {
	"truck and bus":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0}, 
	"farm":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0}, 
	"lcv":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0}, 
	"tt":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0}, 
	"industrial":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0}, 
	"earthmover":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0}, 
	"jeep":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0}, 
	"loose tube/flaps":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0},
	"adv":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0}
	}

hsn_gst = {
	"tyre": {
		"HSN": 4011,
		"GST": 0.28
	},
	"tube": {
		"HSN": 4013,
		"GST": 0.28
	},
	"valve": {
		"HSN": 8481,
		"GST": 0.18
	}
}

#returns true if the row is a vehicle_type row
def is_vehicle_type(cell):
	column_a = cell.lower().strip()

	if (column_a in pv_vehicle_type) or (column_a in other_vehicle_type):
		return True

	return False

#returns the product type (tyre/tube/etc) depending on item_code
def get_product_type(item_code):
	if (item_code[1] in ["U", "W", "Y"]):
		return "tube"
	elif (item_code == "RR100TR414A01"):
		return "valve"
	else:
		return "tyre"

#calculates cost_price based on item_code, net_ndp, vehicle_type
def compute_price(vehicle_type, item_code, net_ndp):
	product_type = get_product_type(item_code)
	if (product_type == "tube"):
		frt = float(pv_vehicle_type[vehicle_type]["tube_freight"])
	elif (product_type == "valve"):
		frt = float(pv_vehicle_type[vehicle_type]["valve_freight"])
	else:
		frt = float(pv_vehicle_type[vehicle_type]["tyre_freight"])

	spd = float(pv_vehicle_type[vehicle_type]["spd"]*net_ndp)
	plsd = float(net_ndp+frt-spd)*float(pv_vehicle_type[vehicle_type]["plsd"])
	taxable_val = float(net_ndp+frt-spd-plsd)
	gst = taxable_val*float(get_gst_rate(item_code))
	cost_price = round(float(taxable_val+gst),2)

	print("\n net ndp: ", net_ndp, "frieght: ", frt, "spd: ", spd, "plsd: ", plsd, "total discount:", spd+plsd,"taxable val: ", taxable_val, "gst: ", gst, "cost price: ", cost_price)
	return cost_price

def compute_size(item_desc):
	if (item_desc == "TR 414 TUBELES TYRE VALVE -D"):
		return "valve"
	else:
		digits = re.findall('\d+', item_desc)
		return "".join(digits)

#returns HSN Code depending on item_code
def get_hsn(item_code):
	product_type = get_product_type(item_code)
	return hsn_gst[product_type]["HSN"]

#returns GST rate depending on item_code
def get_gst_rate(item_code):
	product_type = get_product_type(item_code)
	gst_rate = float(hsn_gst[product_type]["GST"])
	return gst_rate

#categorizes items into segment+tyre or segment+tube
def categorize(vehicle_type, item_code):
	product_type = get_product_type(item_code)
	if (product_type == "tube"):
		return vehicle_type.replace(" ", "_")+"_tube"
	elif (product_type == "valve"):
		return vehicle_type.replace(" ", "_")
	else:
		return vehicle_type.replace(" ", "_")+"_tyre"

#check if item exists, then update the price, else insert the item as new item by computing all columns
def load_to_db(vehicle_type, item_desc, item_code, cost_price):
	#if item already exists then update the price only
	if (Product.objects(itemCode=item_code).first()):
		Product.objects(itemCode=item_code).first().update(costPrice=cost_price)
	#else compute all fields and add the item
	else:
		size = compute_size(item_desc)
		hsn = get_hsn(item_code)
		category = categorize(vehicle_type, item_code)
		gst = get_gst_rate(item_code)
		Product(itemDesc = item_desc, 
				itemCode = item_code, 
				HSN = hsn, 
				GST = gst, 
				category = category, 
				size = size, 
				costPrice = cost_price, 
				stock = 0).save()

def update_price(file):
	wb = openpyxl.load_workbook(file, data_only='True')
	tyres_xl = wb['Sheet1']	
	vehicle_type = ""
	for i in range(1,tyres_xl.max_row+1):
		column_a = tyres_xl.cell(row=i, column=1).value
		
		# skip the row if column_a is empty
		if (not column_a):
			continue

		column_a = str(column_a)
		print("\nrow", i, "column1", column_a)

		# if this row is a vehicle type row, skip it after getting the vehicle type
		if (is_vehicle_type(column_a)):
			vehicle_type = column_a.lower().strip()
			continue

		# skip this row if its not a vehicle type row, neither it contains product info
		if (not vehicle_type):
			continue

		item_desc = str(tyres_xl.cell(row=i, column=1).value).strip()
		item_code = str(tyres_xl.cell(row=i, column=2).value).strip()
		net_ndp = round(float(str(tyres_xl.cell(row=i, column=5).value)))

		if (vehicle_type in pv_vehicle_type):
			cost_price = compute_price(vehicle_type, item_code, net_ndp)
		
		elif (vehicle_type in other_vehicle_type):
			cost_price = 0.0

		load_to_db(vehicle_type, item_desc, item_code, cost_price)

	os.remove(file)

	


	

