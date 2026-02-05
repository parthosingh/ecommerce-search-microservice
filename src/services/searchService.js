const Fuse = require('fuse.js');
const productService = require('./productService');
const { parseQuery } = require('../utils/queryParser');
const { calculateScore } = require('../utils/rankingCalculator');

let fuse = null;

function initFuse() {
  const allProducts = productService.getAllProducts();
  if (allProducts.length === 0) {
    console.log("Warning: No products to index in Fuse");
    return;
  }

  fuse = new Fuse(allProducts, {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'description', weight: 0.3 },
      { name: 'category', weight: 0.2 },
      { name: 'metadata.color', weight: 0.5 },
      { name: 'metadata.storage', weight: 0.5 },
      { name: 'metadata.ram', weight: 0.4 },
    ],
    threshold: 0.45,           // 0.0 = perfect, 1.0 = very loose
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2
  });

  console.log(`Fuse index ready with ${allProducts.length} products`);
}

function performSearch(query) {
  if (!fuse) {
    initFuse();
    if (!fuse) return [];
  }

  const parsed = parseQuery(query);
  console.log("Parsed query:", parsed);

  // Collect candidate IDs
  let candidateIds = new Set();

  // Keyword index (case insensitive)
  parsed.keywords.forEach(kw => {
    const lowerKw = kw.toLowerCase();
    if (productService.keywordIndex.has(lowerKw)) {
      productService.keywordIndex.get(lowerKw).forEach(id => candidateIds.add(id));
    }
  });

  // Fuse fuzzy fallback
  if (candidateIds.size < 30 || parsed.keywords.length === 0) {
    const fuseResults = fuse.search(query);
    fuseResults.forEach(result => {
      candidateIds.add(result.item.productId);
    });
  }

  // Get full products
  let candidates = Array.from(candidateIds)
    .map(id => productService.getProductById(id))
    .filter(Boolean);

  // Apply hard filters
  if (parsed.filters.color) {
    candidates = candidates.filter(p => 
      (p.metadata?.color || '').toLowerCase() === parsed.filters.color
    );
  }
  if (parsed.filters.storage) {
    candidates = candidates.filter(p => 
      (p.metadata?.storage || '').toLowerCase() === parsed.filters.storage
    );
  }
  if (parsed.filters.budget) {
    candidates = candidates.filter(p => p.price <= parsed.filters.budget);
  }

  if (candidates.length === 0) return [];

  // Normalize max values
  const maxValues = {
    maxPrice: Math.max(...candidates.map(p => p.price), 1),
    maxSales: Math.max(...candidates.map(p => p.sales), 1)
  };

  // Score & sort
  const scored = candidates.map(p => ({
    ...p,
    score: calculateScore(p, parsed, maxValues)
  }));

  scored.sort((a, b) => b.score - a.score || b.sales - a.sales || b.rating - a.rating);

  // Final response format
  return scored.slice(0, 20).map(p => ({
    productId: p.productId,
    title: p.title,
    description: p.description,
    mrp: Math.round(p.mrp),
    Sellingprice: Math.round(p.price),
    Metadata: p.metadata,
    stock: p.stock,
    rating: p.rating.toFixed(1)
  }));
}

function initialize() {
  initFuse();
}

module.exports = {
  performSearch,
  initialize
};