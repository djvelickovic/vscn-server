from flask import Flask, request
from pymongo import MongoClient
from vscns.matchers import ScanService
from vscns.cves import CveService
from vscns.transform import TransformService
from dotenv import dotenv_values


app = Flask(__name__)

config = dotenv_values('.env')
mongo_db_url = config['MONGO_DB_URL']
mongo_db_name = config['MONGODB_DATABASE_NAME']

client = MongoClient(mongo_db_url)
vscn = client.get_database(mongo_db_name)

cve_service = CveService(vscn)
scan_service = ScanService(vscn)
transform_service = TransformService()


@app.post('/vscn/scan')
def scan():
    request_body = request.get_json()
    transformed_dependencies = transform_service.transform(request_body['dependencies'])
    dependecy_dict = {dependency['product']: dependency for dependency in transformed_dependencies}
    response = scan_service.scan(dependecy_dict)
    return response


@app.get('/vscn/cve')
def cve():
    cve_ids = request.args.getlist('id')
    return cve_service.get_cves(cve_ids)
