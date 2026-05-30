import flask_smorest
from flask import request, views, send_from_directory, jsonify
from services.report import report_service
blp = flask_smorest.Blueprint("report", "report", url_prefix="/api/reports", description="Operations related to reports")

reports_dir = "/app/tempdata/sales_report/"

@blp.route('/')
class ReportList(views.MethodView):
    def post(self):
        '''Generate a report'''
        data = request.get_json()
        filename = report_service.create_report(reports_dir, data)
        return jsonify(filename)

@blp.route('/item-history/<item_code>')
class ItemHistory(views.MethodView):
    def get(self, item_code):
        '''Get complete purchase/sale history for a product'''
        try:
            result = report_service.get_item_history(item_code)
            return jsonify(result)
        except Exception as e:
            flask_smorest.abort(404, message=str(e))

@blp.route('/<report_name>')
class Report(views.MethodView):
    def get(self, report_name):
        '''Download report'''
        try:
            return send_from_directory(reports_dir, report_name, as_attachment=True)
        except FileNotFoundError:
            flask_smorest.abort(404, message="Item not found.")
