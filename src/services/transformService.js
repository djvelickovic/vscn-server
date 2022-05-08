
module.exports.transformDependency = (dependency) => {
  const { product, version } = dependency
  if (product && version) {

    if (discardDependency(dependency)) {
      return []
    }

    const sanitizedVersion = sanitizeVersion(version)
    const products = transformProducts(expandProduct(product))

    return products.map(p => ({
      product: p,
      version: sanitizedVersion
    }))
  }
}

const expandProduct = (product) => {
  return [
    product,
    ...(removeCoreFromTheEndAndAppendFramework(product))
  ]
}

const transformProducts = (products) => {
  return [
    ...products,
    ...products.flatMap(product => replaceDashWithDownScore(product))
  ]
}

const replaceDashWithDownScore = (product) => {
  if (product.includes('-')) {
    return [product.replaceAll('-', '_')]
  }
  return []
}

const removeCoreFromTheEndAndAppendFramework = (product) => {
  if (product.endsWith('-core') || product.endsWith('_core')) {
    return [product.slice(0, -5), product.slice(0, -5) + '-framework']
  }
  return []
}

const discardDependency = (dependency) => {
  return dependency.version.endsWith('SNAPSHOT')
}


/**
 * Removes words from version
 * @param version
 * @returns {*|string}
 */
const sanitizeVersion = (version) => {
  if (/[a-zA-Z]/.test(version)) {
    const versionWithoutCharacters = version.replaceAll(/[a-zA-Z]*/g, '')
    if (versionWithoutCharacters.endsWith('.') || versionWithoutCharacters.endsWith('-')) {
      return versionWithoutCharacters.slice(0, -1)
    }
    return versionWithoutCharacters
  }
  return version
}