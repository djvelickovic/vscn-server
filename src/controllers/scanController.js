const vulnerabilityService = require('../services/scanService')

module.exports.scan = (req, res) => {
  const { dependencies } = req.body
  vulnerabilityService.scan(dependencies)
    .then(report => res.send('Hello'))
}

module.exports.welcomeMessage = (req, res) => {
  res.status(200).send('Hello world')
}
