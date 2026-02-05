// No need for uuid - using simple counter
let nextProductId = 1001;

const products = new Map();       // productId → product
const keywordIndex = new Map();   // keyword → Set of productIds

function indexProduct(product) {
  const text = [
    product.title || '',
    product.description || '',
    product.category || '',
    ...Object.values(product.metadata || {})
  ]
    .join(' ')
    .toLowerCase();

  const words = text.split(/\W+/).filter(w => w.length >= 2);

  words.forEach(word => {
    if (!keywordIndex.has(word)) {
      keywordIndex.set(word, new Set());
    }
    keywordIndex.get(word).add(product.productId);
  });
}

function addProduct(productData) {
  const product = {
    productId: (nextProductId++).toString(),
    title: productData.title,
    description: productData.description || '',
    price: Number(productData.price),
    mrp: Number(productData.mrp || productData.price * 1.2),
    currency: productData.currency || 'INR',
    rating: Number(productData.rating) || 4.0,
    stock: Number(productData.stock) || 0,
    sales: Number(productData.sales) || 0,
    category: productData.category || 'other',
    returnRate: Number(productData.returnRate) || 0.02,
    complaints: Number(productData.complaints) || 0,
    metadata: productData.metadata || {}
  };

  products.set(product.productId, product);
  indexProduct(product);

  return product;
}

function updateMetadata(productId, metadata) {
  const product = products.get(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  product.metadata = { ...product.metadata, ...metadata };
  indexProduct(product); // re-index

  return product;
}

function getAllProducts() {
  return Array.from(products.values());
}

function getProductById(id) {
  return products.get(id);
}

module.exports = {
  addProduct,
  updateMetadata,
  getAllProducts,
  getProductById,
  // for debugging
  products,
  keywordIndex
};