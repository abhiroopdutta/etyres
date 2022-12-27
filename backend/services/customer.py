from models import Customer

class CustomerService:
    def get_customers(self):
        results = Customer.objects()
        return results

    def create_customer(
        self, 
        contact,
        name, 
        address, 
        GSTIN, 
        vehicleNumber,
    ):
        customer = Customer(
            name = name,
            address = address,
            GSTIN = GSTIN,
            stateCode = "",
            state = "",
            vehicleNumber = vehicleNumber,
            contact = contact
        )
        customer.save()   
        return customer

    def update_customer(
        self, 
        contact,
        name, 
        address, 
        GSTIN, 
        vehicleNumber,
    ):
        customerFound = Customer.objects(contact=contact).first()
        if (customerFound is None):
            return 1
        
        customerFound.update( 
            name = name,
            address = address,
            GSTIN = GSTIN,
            vehicleNumber = vehicleNumber,
        )
        return customerFound

customer_service = CustomerService()