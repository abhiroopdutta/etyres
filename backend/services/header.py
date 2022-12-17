from models import Header

class HeaderService:
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

header_service = HeaderService()