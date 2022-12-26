from models import Supplier

class SupplierService:
    def get_suppliers(self):
        results = Supplier.objects()
        return results

    def create_supplier(self, GSTIN, name):
        supplier = Supplier(GSTIN=GSTIN, name=name)
        supplier.save()   
        return supplier

supplier_service = SupplierService()