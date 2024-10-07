// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAuthenticated } = require('../middleware/auth');

// API routes
router.get('/', productController.getProducts);
router.get('/brands', productController.getBrands);
router.get('/api/details/:productId', productController.getProductDetails);
router.post(
  '/favorite/:productId',
  isAuthenticated,
  productController.favoriteProduct
);
router.delete(
  '/favorite/:productId',
  isAuthenticated,
  productController.unfavoriteProduct
);

module.exports = router;
