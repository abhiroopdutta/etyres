import openpyxl
import re 
from models import Product


pv_vehicle_type = {
	"passenger car":{"tyre_freight":20, "tube_freight":3, "spd":0.015, "plsd":0.05, "gst":0.28}, 
	"2 wheeler":{"tyre_freight":6, "tube_freight":3, "spd":0.015, "plsd":0.05, "gst":0.28}, 
	"3 wheeler":{"tyre_freight":8, "tube_freight":3, "spd":0.015, "plsd":0.05, "gst":0.28},
	"tubeless valve":{ "valve_freight":0, "spd":0.0, "plsd":0.0,"gst":0.18}
	}
other_vehicle_type = ["truck and bus", "farm", "lcv", "scv", "tt", "industrial", "earthmover", "jeep", "loose tube/flaps"]
vehicle = ""

#returns true if vehicle segment has changed value while processing the xlxs file
def set_vehicle_type(cell):
	global vehicle
	column_a = cell.lower().strip()

	if column_a in pv_vehicle_type:
		vehicle = column_a
		return True
	
	elif(column_a in other_vehicle_type):
		vehicle=""
		return True
	
	else:
		return False

#returns true if item is a tube
def product_type(item_code):
	if(item_code[1] in ["U", "W", "Y"]):
		return "tube"
	elif(item_code == "RR100TR414A01"):
		return "valve"
	else:
		return "tyre"


#calculates cost_price based on item_code and net_ndp
def compute_price(item_code, net_ndp):
	if(product_type(item_code) == "tube"):
		frt = float(pv_vehicle_type[vehicle]["tube_freight"])
	elif(product_type(item_code) == "valve"):
		frt = float(pv_vehicle_type[vehicle]["valve_freight"])
	else:
		frt = float(pv_vehicle_type[vehicle]["tyre_freight"])

	spd = float(pv_vehicle_type[vehicle]["spd"]*net_ndp)
	plsd = float(net_ndp+frt-spd)*float(pv_vehicle_type[vehicle]["plsd"])
	taxable_val = float(net_ndp+frt-spd-plsd)
	gst = taxable_val*float(pv_vehicle_type[vehicle]["gst"])
	cost_price = round(float(taxable_val+gst),2)

	return cost_price

#fix this for tubes containing D, 215 D tube..
def compute_size(item_desc):
	if(item_desc == "TR 414 TUBELES TYRE VALVE -D"):
		return "valve"
	else:
		split_words = item_desc.split(' ', 2)
		size= re.sub("[^0-9]", "", split_words[0])
		if "R" in split_words[1]:
			size= re.sub("[^0-9]", "", split_words[0]+split_words[1])
		return size

#returns HSN Code depending on item_code
def compute_hsn(item_code):
	if(product_type(item_code)=="tube"):
		return "4013"
	elif(product_type(item_code) == "valve"):
		return "8481"
	else:
		return "4011"

#categorizes items into segment+tyre or segment+tube
def categorize(item_code):
	if(product_type(item_code) == "tube"):
		return vehicle.replace(" ", "_")+"_tube"
	elif(product_type(item_code) == "valve"):
		return vehicle.replace(" ", "_")
	else:
		return vehicle.replace(" ", "_")+"_tyre"

#check if item exists, then update the price, else insert the item as new item by computing all columns
def load_to_db(item_desc, item_code, cost_price):
	#if item already exists then update the price only
	if(Product.objects(itemCode=item_code).first()):
		Product.objects(itemCode=item_code).first().update(costPrice=cost_price)
	#else compute all fields and add the item
	else:
		size = compute_size(item_desc)
		hsn = compute_hsn(item_code)
		category = categorize(item_code)
		Product(itemDesc=item_desc, itemCode=item_code, HSN=hsn, category=category, size=size, costPrice=cost_price, stock=0).save()

def update_price(file):
	global vehicle
	#change the parameter to file
	wb = openpyxl.load_workbook(file, data_only='True')
	tyres_xl = wb['Sheet1']	
	n_rows = tyres_xl.max_row

	for i in range(1,tyres_xl.max_row+1):
		column_a = tyres_xl.cell(row=i, column=1).value
		#only the process the row if column A is not empty
		if(column_a):
			column_a = str(column_a)

			#if this row is a category row, skip this row after setting the vehicle type
			if(set_vehicle_type(column_a)):
				continue
			if(vehicle in pv_vehicle_type):
				item_desc = str(tyres_xl.cell(row=i, column=1).value)
				item_code = str(tyres_xl.cell(row=i, column=2).value).strip()
				net_ndp = float(tyres_xl.cell(row=i, column=5).value)
				cost_price = compute_price(item_code, net_ndp)

				load_to_db(item_desc, item_code, cost_price)
				
		

	


	

