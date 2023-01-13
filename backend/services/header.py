from models import Header

class HeaderService:
    def seed_headers(self):
        self.create_header("Cash", "cash")
        self.create_header("Bank", "bank")
        self.create_header("Purchase", "regular")
        self.create_header("Sale", "regular")
        self.create_header("Credit Note", "regular")
        self.create_header("Debit Note", "regular")
        self.create_header("Services", "regular")
        self.create_header("Cash (services)", "cash")
        self.create_header("Bank (services)", "bank")

    def create_header(self, headerName, headerType):
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

    def get_headers(self):
        headers = Header.objects()
        return headers

    def get_header(self, headerCode):
        header = Header.objects(code=headerCode).first()
        return header

header_service = HeaderService()