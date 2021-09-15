import openpyxl
import re 

pv_vehicle_type = {
	"passenger car":{"tyre_freight":20, "tube_freight":3, "spd":0.015, "plsd":0.05, "gst":0.28}, 
	"2 wheeler":{"tyre_freight":20, "tube_freight":3, "spd":0.015, "plsd":0.05, "gst":0.28}, 
	"3 wheeler":{"tyre_freight":20, "tube_freight":3, "spd":0.015, "plsd":0.05, "gst":0.28}
	}
other_vehicle_type = ["truck and bus", "farm", "lcv", "scv", "tt", "industrial", "earthmover", "jeep", "loose tube/flaps"]
vehicle = ""

#returns true if vehicle has changed value
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

def compute(item_code, net_ndp):
	if(item_code[1] in ["U", "W", "Y"]):
		frt = float(pv_vehicle_type[vehicle]["tube_freight"])
	else:
		frt = float(pv_vehicle_type[vehicle]["tyre_freight"])

	spd = float(pv_vehicle_type[vehicle]["spd"]*net_ndp)
	plsd = float(net_ndp+frt-spd)*float(pv_vehicle_type[vehicle]["plsd"])
	taxable_val = float(net_ndp+frt-spd-plsd)
	gst = taxable_val*float(pv_vehicle_type[vehicle]["gst"])
	cost_price = round(float(taxable_val+gst),2)

	return cost_price
	
def update_price(file):
	global vehicle
	#change the parameter to file
	wb = openpyxl.load_workbook("price_list.xlsx", data_only='True')
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
				item_code = str(tyres_xl.cell(row=i, column=2).value)
				net_ndp = float(tyres_xl.cell(row=i, column=3).value)
				cost_price = compute(item_code, net_ndp)
				
				split_words = item_desc.split(' ', 2)
				size= re.sub("[^0-9]", "", split_words[0])
				if "R" in split_words[1]:
					size= re.sub("[^0-9]", "", split_words[0]+split_words[1])
				
				print(item_desc, size)
		
update_price("hey")	
	


	

