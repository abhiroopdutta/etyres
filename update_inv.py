import MySQLdb
import re 
import csv	

f = open("password.txt", "r")
pwd = str(f.read().replace('\n', ''))
f.close()
database = MySQLdb.connect (host="localhost", user = "root", passwd = pwd, db = "tyres")
cursor = database.cursor()

select_query = """SELECT QUANTITY FROM pv_tyres where ITEM_CODE=%s"""
update_query = """UPDATE pv_tyres SET QUANTITY = %s WHERE ITEM_CODE=%s;"""

invoice_number = 0

with open('update_stock.xls') as f:
    reader = csv.reader(f, delimiter="\t")
   
    for i, row in enumerate(reader):
    	if i>0:
    		invoice_number = row[0] #check if invoice already updated
    		ITEM_CODE = row[2]
    		cursor.execute(select_query, (ITEM_CODE,))
    		QUANTITY = int(cursor.fetchone()[0])+int(row[4])
    		cursor.execute(update_query, (QUANTITY, ITEM_CODE))


cursor.close()
database.commit()
database.close()


	
	
	
	

	

