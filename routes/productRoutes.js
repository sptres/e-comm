const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAuthenticated } = require('../middleware/auth');

// This route is for the API
router.get('/api/details/:productId', productController.getProductDetails);

// Other routes...
router.get('/', productController.getProducts);
router.get('/brands', productController.getBrands);
router.get('/details/:productId', productController.getProductDetails);
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
