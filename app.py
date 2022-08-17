from flask import Flask, request
from requests import ScanResponse, ScanReuqest, Dependency
from pymongo import MongoClient
from service import CveService, ScanService


app = Flask(__name__)

client = MongoClient('mongodb+srv://djovel:CY16FFToLpVC6vmB@cluster0.l0ius.mongodb.net/?retryWrites=true&w=majority')
vscn = client.get_database('vscn-test')

cve_service = CveService(vscn)
scan_service = ScanService(vscn)


@app.post('/vscn/scan')
def scan():

    dependencies = {
        'jackson-databind': Dependency("jackson-databind", "2.12.6"),
        'h2': Dependency("h2", "1.4.200")
    }

    metadata = None

    response = scan_service.scan(dependencies, metadata)
    # response1 = list(response)
    return response


@ app.get('/vscn/cve')
def cve():
    cve_ids = request.args.getlist('id')
    return cve_service.get_cves(cve_ids)
