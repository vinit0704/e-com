const multer = require('multer')

const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
                      process.env.CLOUDINARY_API_KEY &&
                      process.env.CLOUDINARY_API_SECRET

let upload

if (hasCloudinary) {
  const cloudinary = require('../config/cloudinary')
  const { CloudinaryStorage } = require('multer-storage-cloudinary')

  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder:          'ecommerce/products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation:  [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
      public_id:       `product_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    }),
  })

  upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only images are allowed'), false)
      }
      cb(null, true)
    },
  })

  console.log('☁️  Cloudinary storage active')
} else {
  // Fallback: store in memory (for dev without Cloudinary)
  upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only images are allowed'), false)
      }
      cb(null, true)
    },
  })

  console.log('💾  Memory storage active (no Cloudinary config)')
}

module.exports = upload