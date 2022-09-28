from models import Transaction, Header
from mongoengine import Q
import datetime
import re

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

def get_filtered_transactions(filters = {}, sorters = {}, pageRequest = 1, maxItemsPerPage = 5):
    results = {
        "data": [],
        "pagination": { 
            "pageNumber": 0, 
            "pageSize": 0, 
            "totalResults" : 0 }
        
    }
    page_start = (pageRequest-1)*maxItemsPerPage
    page_end = pageRequest*maxItemsPerPage
    query = Q(transactionId__not__contains="*") # dummy query
    print(filters["header"])
    from_regexp = re.compile('^'+filters["header"])
    to_regexp = re.compile('^\d\d'+filters["header"])
    if (filters["header"]):
        query &= Q(transactionId=from_regexp) | Q(transactionId=to_regexp)
    if (filters["status"]):
        query &= Q(status__in=filters["status"])
    if (filters["paymentMode"]):
        query &= Q(paymentMode__in=filters["paymentMode"])
    if (filters["transactionId"]):
        query &= Q(transactionId__icontains=filters["transactionId"])    
    if (filters["date"]["start"] and filters["date"]["end"]):
        start_datetime = datetime.datetime.strptime(filters["date"]["start"][:10] + " " + "00:00:00", '%Y-%m-%d %H:%M:%S')
        end_datetime = datetime.datetime.strptime(filters["date"]["end"][:10] + " " + "23:59:59", '%Y-%m-%d %H:%M:%S')
        query &= Q(date__gte=start_datetime) & Q(date__lte=end_datetime) 

    results["data"] = Transaction.objects(query).order_by('-_id')[page_start:page_end]
    results["pagination"]["totalResults"] = Transaction.objects(query).order_by('-_id')[page_start:page_end].count()
    results["pagination"]["pageNumber"] = pageRequest
    results["pagination"]["pageSize"] = len(results["data"])
    print(results)
    return results