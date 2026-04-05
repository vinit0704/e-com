const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/review.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get( '/product/:productId', ctrl.getProductReviews);
router.post('/',            verifyToken, ctrl.createReview);
router.put( '/:id',         verifyToken, ctrl.updateReview);
router.delete('/:id',       verifyToken, ctrl.deleteReview);

module.exports = router;
