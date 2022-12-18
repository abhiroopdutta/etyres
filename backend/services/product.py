from models import Product
import re

hsn_gst = {
	"tyre": {
		"HSN": "4011",
		"GST": 0.28
	},
	"tube": {
		"HSN": "4013",
		"GST": 0.28
	},
	"flap": {
		"HSN": "4012",
		"GST": 0.28
	},
	"valve": {
		"HSN": "8481",
		"GST": 0.18
	}
}

#returns the product type (tyre/tube/etc) depending on item_code
def get_product_type(item_code):
	if (item_code[1] in ["U", "W", "Y"]):
		return "tube"
	elif (item_code == "RR100TR414A"):
		return "valve"
	elif (item_code[1] == "V"):
		return "flap"
	else:
		return "tyre"

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

class ProductService:
    def create_product(self, vehicle_type, item_desc, item_code, cost_price):
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
        return 0

    def get_products(self):
        products = Product.objects()
        return products

product_service = ProductService()
