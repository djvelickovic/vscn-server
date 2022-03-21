const scanService = require('../services/scanService')

module.exports.scan = (req, res) => {
  const { dependencies, metadata } = req.body

  const allDependencies = dependencies.reduce((acc, curr) => {
    const { product } = curr
    acc.set(product, curr)
    return acc
  }, new Map())

  scanService.scan(allDependencies, metadata)
    .then(report => res.send(report))
}
