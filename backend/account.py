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
