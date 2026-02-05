const express = require('express');
const router = express.Router();
const productController = require('../../controllers/productController');

router.post('/product', productController.addProduct);
router.put('/product/meta-data', productController.updateMetadata);
router.get('/search/product', productController.searchProducts);

module.exports = router;