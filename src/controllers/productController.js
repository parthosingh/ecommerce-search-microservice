const productService = require('../services/productService');
const searchService = require('../services/searchService');

const addProduct = async (req, res, next) => {
  try {
    const product = await productService.addProduct(req.body);
    res.status(201).json({ productId: product.productId });
  } catch (err) {
    next(err);
  }
};

const updateMetadata = async (req, res, next) => {
  try {
    const { productId, metadata } = req.body;
    if (!productId || !metadata) {
      return res.status(400).json({ error: 'productId and metadata are required' });
    }
    await productService.updateMetadata(productId, metadata);
    res.json({ productId, metadata });
  } catch (err) {
    next(err);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ error: 'query parameter is required' });
    }

    const results = await searchService.performSearch(query.trim());
    res.json({ data: results });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addProduct,
  updateMetadata,
  searchProducts,
};