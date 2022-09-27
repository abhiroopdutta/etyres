from unicodedata import name
from models import Transaction, Header

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
