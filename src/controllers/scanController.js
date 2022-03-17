const scanService = require('../services/scanService')

module.exports.scan = (req, res) => {
  const { dependencies, metadata } = req.body
  scanService.scan(dependencies, metadata)
    .then(report => res.send(report))
}
