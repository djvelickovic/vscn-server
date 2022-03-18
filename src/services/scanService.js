const dbo = require('../db/conn')
const { MONGO_MATCHERS_COLLECTION } = require('../constants/constants')
const { compare } = require('compare-versions')

/**
 *
 * @param {[]} dependencies
 * @param {{os: { product: string, version: string}}} metadata
 * @return {Promise<[]>}
 */
module.exports.scan = async (dependencies, metadata) => {
  const allDependencies = dependencies.reduce((acc, curr) => {
    const { product } = curr
    acc.set(product, curr)
    return acc
  }, new Map())

  const results = []

  for (const dependency of allDependencies.values()) {
    const { product } = dependency

    const cves = await scanDatabase(product)
    const matchedCVEs = cves.filter(cve => traverseCVE(cve, allDependencies, metadata))

    console.log(`For dependency ${dependency} found ${matchedCVEs.length} vulnerabilities`)

    results.push({
      dependency,
      vulnerabilities: matchedCVEs.map(match => match.id)
    })
  }
  return results
}

const scanDatabase = async (product) => dbo.getDb()
  .collection(MONGO_MATCHERS_COLLECTION)
  .find({ products: product })
  .toArray()

const traverseCVE = (cve, allDependencies, metadata) => {
  return cve?.config?.nodes?.some(node => traverseNode(node, allDependencies, metadata))
}

const traverseNode = (node, allDependencies, metadata) => {
  const { cpe_match: cpeMatches, operator, children } = node

  if (operator === 'OR') {
    if (children && children.length > 0) {
      return children.some(node => traverseNode(node, allDependencies, metadata))
    }

    return cpeMatches.some(cpeMatch => hasCPEMatch(cpeMatch, allDependencies, metadata))
  }

  if (operator === 'AND') {
    if (children && children.length > 0) {
      return children.every(node => traverseNode(node, allDependencies, metadata))
    }

    return cpeMatches.every(cpeMatch => hasCPEMatch(cpeMatch, allDependencies, metadata))
  }

  return true
}


const hasCPEMatch = (cpeMatch, allDependencies, metadata) => {
  const {
    type,
    versionStartIncluding,
    versionEndIncluding,
    versionStartExcluding,
    versionEndExcluding,
    exactVersion,
    update,
    target,
    product
  } = cpeMatch

  const { os } = metadata

  let dependency

  if (type === 'o' && os) {
    dependency = os
  } else { // type === 'a' || type === 'h'
    dependency = allDependencies.get(product)
    if (!dependency) {
      return false
    }
  }

  const upperBoundVersion = versionEndIncluding || versionEndExcluding
  const upperBound = upperBoundVersion && { version: upperBoundVersion, include: !!versionEndIncluding }

  const lowerBoundVersion = versionStartIncluding || versionStartExcluding
  const lowerBound = lowerBoundVersion && { version: lowerBoundVersion, include: !!versionStartIncluding }

  try {
    if (dependency.version && (upperBound || lowerBound || exactVersion)) {
      if (upperBound || lowerBound) return isBetween(lowerBound, upperBound, dependency.version)

      if (exactVersion) return exactMatch(exactVersion, dependency.version)
    }

    if (!dependency.version && (upperBound || lowerBound || exactVersion)) {
      return false
    }

  } catch (error) {
    console.error(error)
    return false
  }
  return true
}

/**
 *
 * @param {{version, include}} lowerBound
 * @param {{version, include}} upperBound
 * @param {string} version
 */
const isBetween = (lowerBound, upperBound, version) => {
  let matchLowerBound = true
  let matchUpperBound = true
  if (lowerBound)
    matchLowerBound = compare(version, lowerBound.version, lowerBound.include ? '>=' : '>')

  if (upperBound)
    matchUpperBound = compare(version, upperBound.version, upperBound.include ? '<=' : '<')

  return matchLowerBound && matchUpperBound
}

/**
 *
 * @param {string} exactVersion
 * @param {string} version
 */
const exactMatch = (exactVersion, version) => compare(exactVersion, version, '=')