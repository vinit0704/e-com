const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/address.controller')
const { verifyToken } = require('../middleware/auth.middleware')

router.get(   '/',              verifyToken, ctrl.getAddresses)
router.post(  '/',              verifyToken, ctrl.addAddress)
router.put(   '/:id',          verifyToken, ctrl.updateAddress)
router.delete('/:id',          verifyToken, ctrl.deleteAddress)
router.put(   '/:id/default',  verifyToken, ctrl.setDefault)

module.exports = router