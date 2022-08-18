from flask import Flask, request
from pymongo import MongoClient
from vscns.matchers import ScanService
from vscns.cves import CveService


def create_app(test_condif=None):

    app = Flask(__name__)

    app.config.from_prefixed_env(prefix='FLASK')
    client = MongoClient(app.config['MONGO_DB_URL'])
    vscn = client.get_database('vscn-test')

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

    return app
