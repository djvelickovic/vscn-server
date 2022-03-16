const express = require('express')
const router = express.Router()
const controller = require('../controllers/cveController')

router.get('/', controller.getCVEs)

module.exports = router;