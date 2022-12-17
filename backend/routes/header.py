import flask_smorest
from flask import request, views
import marshmallow_mongoengine as mamo
from models import Header
from services.header import header_service

blp = flask_smorest.Blueprint("header", "header", url_prefix="/api/headers", description="Operations related to accounting headers")

class HeaderSchema(mamo.ModelSchema):
    class Meta:
        model = Header
        exclude = ['id']

@blp.route('')
class HeaderList(views.MethodView):
    @blp.response(200, HeaderSchema(many=True))
    def get(self):
        '''List all headers'''
        result = header_service.get_headers()
        return result

    def post(self):
        '''Create a header'''
        data = request.get_json()
        header_service.create_header(**data)
        return "success", 200

