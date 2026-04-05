const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/newsletter.controller')
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware')

router.post('/subscribe',           ctrl.subscribe)
router.get( '/unsubscribe/:email',  ctrl.unsubscribe)
router.get( '/',     verifyToken, requireAdmin, ctrl.getSubscribers)
router.post('/send', verifyToken, requireAdmin, ctrl.sendNewsletter)

module.exports = router