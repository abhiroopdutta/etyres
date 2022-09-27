from models import Transaction, Header
from mongoengine import Q
import datetime

def add_header_item(header):
    previous_header = Header.objects().order_by('-_id').first()
    if(previous_header is None):
        header_code = "00"
    else:
        header_code = f'{(int(previous_header.code) + 1):02}'
    Header(
        code = header_code, 
        name = header["headerName"],
        type = header["headerType"],
        ).save()
    return 0

def add_transaction_item(transaction):
    query = Q(transactionId__startswith=transaction["from"]+transaction["to"])
    previous_transaction = Transaction.objects(query).order_by('-_id').first()
    
    if(previous_transaction is None):
        transaction_id = transaction["from"] + transaction["to"] + "0"
    else:
        transaction_id = transaction["from"] + transaction["to"] +  f'{(int(previous_transaction.transactionId[4:]) + 1)}'
    Transaction(
        transactionId = transaction_id,
        date = datetime.datetime.strptime(transaction["dateTime"], "%Y-%m-%d %H:%M:%S"),
        amount = transaction["amount"],
        status = transaction["status"],
        paymentMode = transaction["paymentMode"],
        description = transaction["description"]
        ).save()
    return 0