const express = require('express')
const router = express.Router()
const controller = require('../controllers/cveController')

router.post('/', controller.getCVEDetails)

module.exports = router;