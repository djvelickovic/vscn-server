from flask import Flask, request
from requests import Dependency
from pymongo import MongoClient
from matchers import ScanService
from cves import CveService


app = Flask(__name__)

app.config.from_prefixed_env(prefix='FLASK')


client = MongoClient(app.config['MONGO_DB_URL'])
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
    return response


@ app.get('/vscn/cve')
def cve():
    cve_ids = request.args.getlist('id')
    return cve_service.get_cves(cve_ids)
