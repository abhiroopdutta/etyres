from models import Customer

class CustomerService:
    def get_customers(self):
        results = Customer.objects()
        return results

    def create_customer(
        self, 
        name, 
        address, 
        GSTIN, 
        stateCode,
        state,
        vehicleNumber,
        contact
    ):
        customer = Customer(
            name = name,
            address = address,
            GSTIN = GSTIN,
            stateCode = stateCode,
            state = state,
            vehicleNumber = vehicleNumber,
            contact = contact
        )
        customer.save()   
        return customer

customer_service = CustomerService()