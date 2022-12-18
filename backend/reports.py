from models import Purchase, Sale, Product

def reset_stock():
    for product in Product.objects():
        product.update(stock = 0)

    for invoice in Purchase.objects:
        for product in invoice.items:
            product_found = Product.objects(itemCode=product.itemCode).first()
            if product_found is None:
                print(f'Item from Purchase Invoice No. {invoice.invoiceNumber} not found in Product table:  {product.itemDesc}, {product.itemCode}, ')
                return False
            new_stock = product_found.stock + product.quantity
            Product.objects(itemCode=product.itemCode).first().update(stock=new_stock) 
    
    for invoice in Sale.objects:
        for product in invoice.productItems:
            product_found = Product.objects(itemCode=product.itemCode).first()
            if product_found is None:
                print(f'Item from Sale Invoice No. {invoice.invoiceNumber} not found in Product table:  {product.itemDesc}, {product.itemCode}, ')
                return False
            new_stock = product_found.stock - product.quantity
            Product.objects(itemCode=product.itemCode).first().update(stock=new_stock)
    return True    