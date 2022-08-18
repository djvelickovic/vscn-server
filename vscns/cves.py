from pymongo import database
from typing import List


class CveService(object):
    def __init__(self, vscn_db: database.Database):
        self.cves = vscn_db.get_collection('cve')

    def get_cves(self, cve_ids: List[str]):
        result = self.cves.find({'id': {'$in': cve_ids}})
        r = []
        for cve in result:
            cve.pop('_id')
            r.append(cve)
        return r
