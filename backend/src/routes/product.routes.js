const express  = require('express')
const router   = express.Router()
const ctrl     = require('../controllers/product.controller')
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware')
const upload   = require('../middleware/upload.middleware')

// ✅ Optional upload — handles both JSON and form-data
const optionalUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || ''
  if (contentType.includes('multipart/form-data')) {
    return upload.array('images', 5)(req, res, next)
  }
  next()
}

// Public
router.get('/',    ctrl.getProducts)
router.get('/:id', ctrl.getProduct)

// Admin
router.post('/',   verifyToken, requireAdmin, optionalUpload, ctrl.createProduct)
router.put('/:id', verifyToken, requireAdmin, optionalUpload, ctrl.updateProduct)
router.delete('/:id',                         verifyToken, requireAdmin, ctrl.deleteProduct)
router.delete('/:id/images/:imageId',         verifyToken, requireAdmin, ctrl.deleteProductImage)
router.put('/:productId/images/:imageId/primary', verifyToken, requireAdmin, ctrl.setPrimaryImage)

module.exports = router
