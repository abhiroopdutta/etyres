from unittest import result
from models import Transaction, Header
from mongoengine import Q
import datetime
import re

def add_header_item(headerName, headerType):
    previous_header = Header.objects().order_by('-_id').first()
    if(previous_header is None):
        header_code = "00"
    else:
        header_code = f'{(int(previous_header.code) + 1):02}'
    Header(
        code = header_code, 
        name = headerName,
        type = headerType,
        ).save()
    return 0

def add_transaction_item(transactionFrom, transactionTo, dateTime, amount, status, paymentMode, description):
    query = Q(transactionId__startswith=transactionFrom+transactionTo)
    previous_transaction = Transaction.objects(query).order_by('-_id').first()
    
    if(previous_transaction is None):
        transaction_id = transactionFrom + transactionTo + "0"
    else:
        transaction_id = transactionFrom + transactionTo +  f'{(int(previous_transaction.transactionId[4:]) + 1)}'
    Transaction(
        transactionId = transaction_id,
        date = datetime.datetime.strptime(dateTime, "%Y-%m-%d %H:%M:%S"),
        amount = amount,
        status = status,
        paymentMode = paymentMode,
        description = description
        ).save()
    return 0

def get_filtered_transactions(filters = {}, sorters = {}, pageRequest = 1, maxItemsPerPage = 5):
    results = {
        "data": [],
        "balance": 0,
        "pagination": { 
            "pageNumber": 0, 
            "pageSize": 0, 
            "totalResults" : 0 },
        
    }
    page_start = (pageRequest-1)*maxItemsPerPage
    page_end = pageRequest*maxItemsPerPage
    query = Q(transactionId__not__contains="*") # dummy query
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

    all_results = Transaction.objects(query).order_by('-_id')

    balance = 0
    for transaction in all_results:
        if (re.search(from_regexp, transaction.transactionId) is not None):
            balance -= transaction.amount
        else:
            balance += transaction.amount

    results["data"] = all_results[page_start:page_end]
    results["balance"] = balance
    results["pagination"]["totalResults"] = all_results.count()
    results["pagination"]["pageNumber"] = pageRequest
    results["pagination"]["pageSize"] = len(results["data"])
    return results