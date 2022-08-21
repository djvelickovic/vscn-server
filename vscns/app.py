from flask import Flask, request
from pymongo import MongoClient
from vscns.matchers import ScanService
from vscns.cves import CveService
from dotenv import dotenv_values


app = Flask(__name__)

config = dotenv_values('.env')
mongo_db_url = config['MONGO_DB_URL']
mongo_db_name = config['MONGODB_DATABASE_NAME']

client = MongoClient(mongo_db_url)
vscn = client.get_database(mongo_db_name)

cve_service = CveService(vscn)
scan_service = ScanService(vscn)


@app.post('/vscn/scan')
def scan():
    request_body = request.get_json()
    dependecy_dict = {dependency['product']: dependency for dependency in request_body['dependencies']}
    print(dependecy_dict)
    response = scan_service.scan(dependecy_dict)
    return response


@app.get('/vscn/cve')
def cve():
    cve_ids = request.args.getlist('id')
    return cve_service.get_cves(cve_ids)
