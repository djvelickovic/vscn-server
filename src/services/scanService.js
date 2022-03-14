const dbo = require('../db/conn')
const { MONGO_MATCHERS_COLLECTION } = require('../constants/constants')
const compareVersions = require('compare-versions')
/**
 *
 * @param {[]} dependencies
 * @return {Promise<[]>}
 */
module.exports.scan = async (dependencies) => {

  const results = []

  for (const dependency of dependencies) {

    const vulnerabilities = await scanDatabase(dependency.product)
    const matched = filterRelevant(vulnerabilities, dependency)
    console.log(`For dependency ${dependency} found ${matched.length} vulnerabilities`)

    results.push({
      dependency,
      cve: matched.map(match => match.id)
    })
  }

  return results
}

const scanDatabase = async (product) => dbo.getDb()
  .collection(MONGO_MATCHERS_COLLECTION)
  .find({ products: product })
  .toArray()

/**
 *
 * @param vulnerabilities
 * @param {{product: string, version: string}} dependency
 * @return {*}
 */
const filterRelevant = (vulnerabilities, dependency) => {
  console.log(`Scanning ${vulnerabilities.length} for ${dependency.product} - ${dependency.version}`)

  //TODO: implement crosschecking logic

  return vulnerabilities.filter(vulnerability => vulnerability.config.nodes.some(node => {

    const { cpe_match: matches } = node

    if (!matches) return false

    const match = matches.some(match => {
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
      } = match

      // TODO: implement crosscheck
      if (type !== 'a') return false
      if (product !== dependency.product) return false

      const upperBoundVersion = versionEndIncluding || versionEndExcluding
      const upperBound = upperBoundVersion && { version: upperBoundVersion, include: !!versionEndIncluding }

      const lowerBoundVersion = versionStartIncluding || versionStartExcluding
      const lowerBound = lowerBoundVersion && { version: lowerBoundVersion, include: !!versionStartIncluding }

      if (upperBound || lowerBound) return isBetween(lowerBound, upperBound, dependency.version)

      if (exactVersion) return exactMatch(exactVersion, dependency.version)

      return true
    })

    if (match) return true
  }))
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
    matchLowerBound = compareVersions.compare(version, lowerBound.version, lowerBound.include ? '>=' : '>')

  if (upperBound)
    matchUpperBound = compareVersions.compare(version, upperBound.version, upperBound.include ? '<=' : '<')

  return matchLowerBound && matchUpperBound
}

/**
 *
 * @param {string} exactVersion
 * @param {string} version
 */
const exactMatch = (exactVersion, version) => compareVersions.compare(exactVersion, version, '=')