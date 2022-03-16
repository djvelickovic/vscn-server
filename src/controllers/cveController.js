const cveService = require('../services/cveService')

module.exports.getCVEs = (req, res) => {
  const cveList = [
    ...(Array.isArray(req.query.id) ? req.query.id : [req.query.id])
  ]

  cveService.getCVEs(cveList)
    .then(result => {
      result.forEach(cve => delete cve._id)
      res.send(result)
    })
}
