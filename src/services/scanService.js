const dbo = require('../db/conn')
const { MONGO_MATCHERS_COLLECTION } = require('../constants/constants')

/**
 *
 * @param {[]} dependencies
 * @return {Promise<[]>}
 */
module.exports.scan = async (dependencies) => {
  console.log(`Checking vulnerabilities... ${dependencies}`)

  const results = []

  for (const dependency of dependencies) {
    const { product, version } = dependency

    console.log(product, version)

    const vulnerabilities = await scanDatabase(product)
    const matched = filterRelevant(vulnerabilities, product, version)
    console.log(`For dependency ${product} - ${version} found ${matched.length} vulnerabilities`)

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

const filterRelevant = (vulnerabilities, product, version) => {
  console.log(`Scanning ${vulnerabilities.length} for ${product} - ${version}`)
  //TODO: implement checking logic
  return vulnerabilities.slice(0, 5)
}