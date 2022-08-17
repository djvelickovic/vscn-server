from pymongo import database
from typing import List, Dict
from requests import Dependency
from packaging import version


class ScanService(object):
    def __init__(self, vscn_db: database.Database):
        self.matchers = vscn_db.get_collection('matchers')

    def scan(self, dependencies: Dict[str, Dependency], metadata) -> List:
        results = []

        for dependency in dependencies.values():
            cves = self.__scan_for_cves(dependency.product)
            matched_cves = filter(get_traverse_cve(dependencies, metadata), cves)

            unique_and_sorted_cves = {cve for cve in sorted(map(lambda cve: cve['id'], matched_cves))}

            print(f'Dependency {dependency.product} has {len(unique_and_sorted_cves)} vulnerabilities')

            if len(unique_and_sorted_cves) > 0:
                results.append({
                    'dependency': vars(dependency),
                    'vulnerabilities': list(unique_and_sorted_cves)
                })

        return results

    def __scan_for_cves(self, product: str) -> List:
        result = self.matchers.find({'products': product})
        return result


def get_traverse_cve(dependencies, metadata):
    def traverse_cve(cve):
        if cve['config'] and cve['config']['nodes']:
            nodes = cve['config']['nodes']
            return some(get_traverse_node(dependencies, metadata), nodes)
        return False
    return traverse_cve


def get_traverse_node(dependencies, metadata):
    def traverse_node(node):
        cpe_match = node['cpe_match']
        operator = node['operator']
        children = node['children']

        if operator == 'OR':
            if children and len(children) > 0:
                return some(traverse_node, children)
            return some(get_has_cpe_match(dependencies, metadata), cpe_match)

        if operator == 'AND':
            if children and len(children) > 0:
                return every(traverse_node, children)
            return every(get_traverse_cve(dependencies, metadata), cpe_match)

        return True
    return traverse_node


def get_has_cpe_match(dependencies: Dict[str, Dependency], metadata):
    def has_cpe_match(cpe_match: dict):
        version_start_including = cpe_match.get('versionStartIncluding')
        version_end_including = cpe_match.get('versionEndIncluding')
        version_start_excluding = cpe_match.get('versionStartExcluding')
        version_end_excluding = cpe_match.get('versionEndExcluding')
        exact_version = cpe_match.get('exactVersion')
        product = cpe_match.get('product')

        dependency: Dependency = dependencies.get(product)

        if not dependency:
            return False

        upper_bound_version = version_end_including if version_end_including else version_end_excluding
        upper_bound = {'version': upper_bound_version,
                       'include': True if version_end_including else False} if upper_bound_version else None

        lower_bound_version = version_start_including if version_start_including else version_start_excluding
        lower_bound = {'version': lower_bound_version,
                       'include': True if version_start_including else False} if lower_bound_version else None

        if (dependency.version and (upper_bound or lower_bound or exact_version)):
            if (upper_bound or lower_bound):
                return is_between(lower_bound, upper_bound, dependency.version)
            if exact_version:
                return exact_match(exact_version, dependency.version)

        if not dependency.version and (upper_bound or lower_bound or exact_version):
            return False

        return True

    return has_cpe_match


def some(pred, _list) -> bool:
    return any(pred(i) for i in _list)


def every(pred, _list) -> bool:
    return all(pred(i) for i in _list)


def is_between(lower_bound, upper_bound, current_version):
    match_lower_bound = True
    match_upper_bound = True

    parsed_version = version.parse(current_version)

    if lower_bound:
        parsed_lower_bound = version.parse(lower_bound['version'])
        match_lower_bound = parsed_lower_bound <= parsed_version if lower_bound[
            'include'] else parsed_lower_bound < parsed_version

    if upper_bound:
        parsed_upper_bound = version.parse(upper_bound['version'])
        match_upper_bound = parsed_upper_bound >= parsed_version if upper_bound[
            'include'] else parsed_upper_bound > parsed_version

    return match_lower_bound and match_upper_bound


def exact_match(exact_version, current_version):
    return version.parse(exact_version) == version.parse(current_version)
