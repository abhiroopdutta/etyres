from models import Supplier

class SupplierService:
    def get_suppliers(self):
        results = Supplier.objects()
        return results

    def create_supplier(self, GSTIN, name):
        Supplier(GSTIN=GSTIN, name=name).save()   

supplier_service = SupplierService()