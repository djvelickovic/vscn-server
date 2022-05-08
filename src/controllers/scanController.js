const scanService = require('../services/scanService')
const { transformDependency } = require('../services/transformService')
module.exports.scan = (req, res) => {
  const { dependencies, metadata } = req.body

  const allDependencies = dependencies.reduce((acc, curr) => {
    const { product } = curr
    const expandedDependencies = transformDependency(curr)
    if (product) {
      expandedDependencies.forEach(dependency => {
        acc.set(dependency.product, dependency)
      })
    }
    return acc
  }, new Map())

  scanService.scan(allDependencies, metadata)
    .then(report => res.send(report))
}
