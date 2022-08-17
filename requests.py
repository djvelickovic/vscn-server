from typing import List


class Dependency(object):
    def __init__(self, product: str, version: str):
        self.product = product
        self.version = version


class ScanReuqest(object):
    def __init__(self, dependencies: List[Dependency], metadata):
        self.dependencies = dependencies
        self.metadata = metadata

    def __str__(self):
        return f'dependencies={self.dependencies} metadata={self.metadata}'


class ScanResponse(object):
    def __init__(self, id: str, ref: List, desc: str, severity: str, published: str, lastModified: str,
                 sha256: str, year: str):
        self.id = id
        self.ref = ref
        self.desc = desc
        self.severity = severity
        self.published = published
        self.lastModified = lastModified
        self.sha256 = sha256
        self.year = year
