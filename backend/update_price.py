import openpyxl
import re, os
from models import Product


pv_vehicle_type = {
	"passenger car":{"tyre_freight":20, "tube_freight":3, "spd":0.015, "plsd":0.025, "gst":0.28}, 
	"2 wheeler":{"tyre_freight":6, "tube_freight":3, "spd":0.015, "plsd":0.025, "gst":0.28}, 
	"3 wheeler":{"tyre_freight":8, "tube_freight":3, "spd":0.015, "plsd":0.05, "gst":0.28},
	"scv":{"tyre_freight":40, "tube_freight":3, "spd":0.014, "plsd":0.025, "gst":0.28},
	"tubeless valve":{ "valve_freight":0, "spd":0.0, "plsd":0.0,"gst":0.18}
	}
other_vehicle_type = {
	"truck and bus":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0, "gst":0.28}, 
	"farm":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0, "gst":0.28}, 
	"lcv":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0, "gst":0.28}, 
	"tt":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0, "gst":0.28}, 
	"industrial":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0, "gst":0.28}, 
	"earthmover":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0, "gst":0.28}, 
	"jeep":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0, "gst":0.28}, 
	"loose tube/flaps":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0, "gst":0.28},
	"adv":{"tyre_freight":0, "tube_freight":0, "spd":0.0, "plsd":0.0, "gst":0.28}
	}

#returns true if vehicle segment has changed value while processing the xlxs file
def find_vehicle_type(cell):
	column_a = cell.lower().strip()

	if (column_a in pv_vehicle_type) or (column_a in other_vehicle_type):
		vehicle = column_a
		return vehicle
	
	else:
		return ""

#returns true if item is a tube
def product_type(item_code):
	if(item_code[1] in ["U", "W", "Y"]):
		return "tube"
	elif(item_code == "RR100TR414A01"):
		return "valve"
	else:
		return "tyre"


#calculates cost_price based on item_code and net_ndp
def compute_price(vehicle_type, item_code, net_ndp):
	if(product_type(item_code) == "tube"):
		frt = float(pv_vehicle_type[vehicle_type]["tube_freight"])
	elif(product_type(item_code) == "valve"):
		frt = float(pv_vehicle_type[vehicle_type]["valve_freight"])
	else:
		frt = float(pv_vehicle_type[vehicle_type]["tyre_freight"])

	spd = float(pv_vehicle_type[vehicle_type]["spd"]*net_ndp)
	plsd = float(net_ndp+frt-spd)*float(pv_vehicle_type[vehicle_type]["plsd"])
	taxable_val = float(net_ndp+frt-spd-plsd)
	gst = taxable_val*float(pv_vehicle_type[vehicle_type]["gst"])
	cost_price = round(float(taxable_val+gst),2)

	print("\nfrieght ", frt, "spd ", spd, "plsd ", plsd, "total discount", spd+plsd,"taxable val ", taxable_val, "gst ", gst, "cost price ", cost_price)
	return cost_price

def compute_size(item_desc):
	if(item_desc == "TR 414 TUBELES TYRE VALVE -D"):
		return "valve"
	else:
		digits = re.findall('\d+', item_desc)
		return "".join(digits)

#returns HSN Code depending on item_code
def compute_hsn(item_code):
	if(product_type(item_code)=="tube"):
		return "4013"
	elif(product_type(item_code) == "valve"):
		return "8481"
	else:
		return "4011"

#categorizes items into segment+tyre or segment+tube
def categorize(vehicle_type, item_code):
	if(product_type(item_code) == "tube"):
		return vehicle_type.replace(" ", "_")+"_tube"
	elif(product_type(item_code) == "valve"):
		return vehicle_type.replace(" ", "_")
	else:
		return vehicle_type.replace(" ", "_")+"_tyre"

#check if item exists, then update the price, else insert the item as new item by computing all columns
def load_to_db(vehicle_type, item_desc, item_code, cost_price):
	#if item already exists then update the price only
	if(Product.objects(itemCode=item_code).first()):
		Product.objects(itemCode=item_code).first().update(costPrice=cost_price)
	#else compute all fields and add the item
	else:
		size = compute_size(item_desc)
		hsn = compute_hsn(item_code)
		category = categorize(vehicle_type, item_code)
		if(vehicle_type in pv_vehicle_type):
			gst = float(pv_vehicle_type[vehicle_type]["gst"])
		else:
			gst = float(other_vehicle_type[vehicle_type]["gst"])
		Product(itemDesc=item_desc, itemCode=item_code, HSN=hsn, GST=gst, category=category, size=size, costPrice=cost_price, stock=0).save()

def update_price(file):

	#change the parameter to file
	wb = openpyxl.load_workbook(file, data_only='True')
	tyres_xl = wb['Sheet1']	
	n_rows = tyres_xl.max_row
	vehicle_type = ""
	for i in range(1,tyres_xl.max_row+1):
		column_a = tyres_xl.cell(row=i, column=1).value
		#only the process the row if column A is not empty
		if(column_a):
			column_a = str(column_a)
			print("row", i, "column1", column_a)

			#if this row is a category row, skip this row after getting the vehicle type
			if(find_vehicle_type(column_a) in pv_vehicle_type) or (find_vehicle_type(column_a) in other_vehicle_type):
				vehicle_type = find_vehicle_type(column_a)
				continue
			if(vehicle_type in pv_vehicle_type):
				item_desc = str(tyres_xl.cell(row=i, column=1).value).strip()
				item_code = str(tyres_xl.cell(row=i, column=2).value).strip()
				net_ndp = float(str(tyres_xl.cell(row=i, column=5).value))
				cost_price = compute_price(vehicle_type, item_code, net_ndp)
				load_to_db(vehicle_type, item_desc, item_code, cost_price)
			
			elif(vehicle_type in other_vehicle_type):
				item_desc = str(tyres_xl.cell(row=i, column=1).value).strip()
				item_code = str(tyres_xl.cell(row=i, column=2).value).strip()
				cost_price = 0.0
				load_to_db(vehicle_type, item_desc, item_code, cost_price)

	os.remove(file)

	


	

