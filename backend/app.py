from flask import Flask, render_template,jsonify
from flaskext.mysql import MySQL
mysql = MySQL()

app = Flask(__name__)
mysql.init_app(app)

app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = 'Eureka1263'
app.config['MYSQL_DATABASE_DB'] = 'tyres'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'

conn = mysql.connect()
cursor =conn.cursor()
cursor.execute("SELECT * from pv_tyres WHERE QUANTITY>0")
data = list(cursor.fetchall())

@app.route("/data", methods = ['GET'])
def hello_world():
   return jsonify(data)

