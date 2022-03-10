const express = require('express')
const router = express.Router()
const controller = require('../controllers/scanController')

router.post('/', controller.scan)
router.get('/', controller.welcomeMessage)


module.exports = router;
