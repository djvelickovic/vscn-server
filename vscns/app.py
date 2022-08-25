from flask import Flask, request
from pymongo import MongoClient
from vscns.matchers import ScanService
from vscns.cves import CveService
from vscns.transform import TransformService
from dotenv import load_dotenv
import os

import json

load_dotenv()

app = Flask(__name__)

mongo_db_url = os.environ['MONGO_DB_URL']
mongo_db_name = os.environ['MONGODB_DATABASE_NAME']
debug = os.environ['DEBUG'].lower() == 'true'

client = MongoClient(mongo_db_url)
vscn = client.get_database(mongo_db_name)

products_set = set()

if debug:
    print('Loaded products match from locale')
    with open('products-set.json', 'r') as f:
        products_set = set(json.load(f))
else:
    print('Loaded products match from database')
    matchers = vscn.get_collection('matchers')
    all_products = matchers.distinct('products')
    products_set = set(all_products)

cve_service = CveService(vscn)
scan_service = ScanService(products_set, vscn)
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
