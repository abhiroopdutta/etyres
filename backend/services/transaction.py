from models import Transaction
import datetime
import re
from models import Transaction
from mongoengine import Q
import datetime

class TransactionService:
    def create_transaction(self, transactionFrom, transactionTo, dateTime, amount, status, paymentMode, description="", reference_id = ""):
        query = Q(transactionId__startswith=f"{transactionFrom}_{transactionTo}_{reference_id}")
        previous_transaction = Transaction.objects(query).order_by('-_id').first()
        
        if(previous_transaction is None):
            transaction_id = f"{transactionFrom}_{transactionTo}_{reference_id}_0"
        else:
            transaction_number = int(previous_transaction.transactionId.split("_")[-1]) + 1 
            transaction_id = f"{transactionFrom}_{transactionTo}_{reference_id}_{transaction_number}"
    
        dateTimeObj = dateTime
        if isinstance(dateTime, str):
            dateTimeObj = datetime.datetime.strptime(dateTime, "%Y-%m-%d %H:%M:%S")
    
        Transaction(
            transactionId = transaction_id,
            date = dateTimeObj,
            amount = amount,
            status = status,
            paymentMode = paymentMode,
            description = description
            ).save()
        return 0

    def get_transactions(
        self,
        header = "",
        status = "",
        paymentMode = "",
        transactionId = "",
        start = "",
        end = "",
        page = 1,
        page_size = 5,
    ):
        results = {
            "data": [],
            "count": 0,
        }
        page_start = (page-1)*page_size
        page_end = page*page_size
        query = Q(transactionId__not__contains="*") # dummy query
        from_regexp = re.compile('^'+header)
        to_regexp = re.compile('^\d\d_'+header)
        if (header):
            query &= Q(transactionId=from_regexp) | Q(transactionId=to_regexp)
        if (status):
            query &= Q(status__in=status)
        if (paymentMode):
            query &= Q(paymentMode__in=paymentMode)
        if (transactionId):
            query &= Q(transactionId__icontains=transactionId)    
        if (start and end):
            start_datetime = datetime.datetime.strptime(start[:10] + " " + "00:00:00", '%Y-%m-%d %H:%M:%S')
            end_datetime = datetime.datetime.strptime(end[:10] + " " + "23:59:59", '%Y-%m-%d %H:%M:%S')
            query &= Q(date__gte=start_datetime) & Q(date__lte=end_datetime) 
    
        all_results = Transaction.objects(query).order_by('-_id')
    
        balance = 0
        for transaction in all_results:
            if (re.search(from_regexp, transaction.transactionId) is not None):
                balance -= transaction.amount
            else:
                balance += transaction.amount
    
        results["balance"] = balance
        results["data"] = all_results[page_start:page_end]
        results["count"]= all_results.count()
        return results

    def delete_transaction(self, transactionFrom, transactionTo, reference_id):
        #last digit is 0 since there can always be only 1 transaction for any notax invoice
        transaction_found = Transaction.objects.get(transactionId=f"{transactionFrom}_{transactionTo}_{reference_id}_0")
        transaction_found.delete()

transaction_service = TransactionService()