
import re


class TransformService(object):

    def transform(self, dependencies: list) -> list:
        result = []
        for dependency in dependencies:
            transformed_dependencies = self.__transform_dependency(dependency)
            result.extend(transformed_dependencies)

        return result

    def __transform_dependency(self, dependency):
        product = dependency['product']
        version = dependency['version']

        if self.__should_skip_dependency(dependency):
            return []

        sanitized_version = self.__sanitize_version(version)
        expanded_product = self.__expand_product(product)
        products = self.__transform_products(expanded_product)

        def build_product_object(p):
            return {
                'product': p,
                'original_product': product,
                'version': sanitized_version
            }

        return list(map(build_product_object, products))

    def __expand_product(self, product) -> list:

        rules = [
            self.__remove_core_from_the_end_and_append_framework(product),
            self.__append_jdbc_driver_if_contains_sql(product),
            self.__remove_tokens(product)
        ]

        result = [product]
        for rule in rules:
            result.extend(rule)

        return result

    def __transform_products(self, products: list):
        result = []
        result.extend(products)
        transformed = list(map(self.__replace_dash_with_downscore, products))
        for items in transformed:
            result.extend(items)
        return result

    def __replace_dash_with_downscore(self, product: str):
        if '-' in product:
            return [product.replace('-', '_')]
        return []

    def __remove_core_from_the_end_and_append_framework(self, product: str) -> list:
        if product.endswith('-core') or product.endswith('_core'):
            return [product[0:-5], f'{product[0:-5]}-framework']
        return []

    def __remove_tokens(self, product: str) -> list:
        if not (product.endswith('-core') or product.endswith('_core') or product.endswith('_common') or product.endswith('-common')):
            return []

        tokens = re.split(r'-|_', product)

        result = set()

        for i in range(0, len(tokens)):
            result.add('_'.join(tokens[0:len(tokens) - i]))
            result.add('-'.join(tokens[0:len(tokens) - i]))

        return list(result)

    def __append_jdbc_driver_if_contains_sql(self, product: str) -> list:
        if 'sql' in product or product in {'postgresql'}:
            return [f'{product}_jdbc_driver']
        return []

    def __should_skip_dependency(self, dependency) -> bool:
        return dependency['version'].endswith('SNAPSHOT')

    def __sanitize_version(self, version: str):
        version_without_characters = re.sub(r'[a-zA-Z]', '', version)
        if version_without_characters.endswith('.') or version_without_characters.endswith('-'):
            return version_without_characters[0:-1]
        return version_without_characters
