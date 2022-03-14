const scanService = require('../services/scanService')

module.exports.scan = (req, res) => {
  const { dependencies } = req.body
  scanService.scan(dependencies)
    .then(report => res.send(report))
}
