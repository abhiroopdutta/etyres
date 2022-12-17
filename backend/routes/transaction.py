import datetime
import flask_smorest
from flask import request, views
import marshmallow_mongoengine as mamo
import marshmallow as ma
from mongoengine import Q
from models import Transaction
from services.transaction import transaction_service

blp = flask_smorest.Blueprint("transaction", "transaction", url_prefix="/api/transactions", description="Operations related to transactions")

class TransactionSchema(mamo.ModelSchema):
    class Meta:
        model = Transaction
        exclude = ['id']

class TransactionQuerySchema(ma.Schema):
    header = ma.fields.Str()
    status = ma.fields.List(ma.fields.Str(), validate=ma.validate.ContainsOnly(["due", "paid"]))
    paymentMode = ma.fields.List(ma.fields.Str(), validate=ma.validate.ContainsOnly(["cash", "card", "UPI", "bankTransfer", "creditNote"]))
    transactionId = ma.fields.Str()
    start = ma.fields.Str()
    end = ma.fields.Str()

@blp.route('')
class TransactionList(views.MethodView):
    @blp.arguments(TransactionQuerySchema, location="query")
    @blp.response(200, TransactionSchema(many=True))
    @blp.paginate()
    def get(self, args, pagination_parameters):
        '''List all transactions'''
        result = transaction_service.get_transactions(**args, page=pagination_parameters.page, page_size=pagination_parameters.page_size)
        pagination_parameters.item_count = result["count"]
        return result["data"]

    def post(self):
        '''Create a transaction'''
        data = request.get_json()
        transaction_service.create_transaction(**data)
        return "success", 200

