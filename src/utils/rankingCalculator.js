function calculateScore(product, parsedQuery, maxValues) {
  let score = 0;

  // Rating (20%)
  score += (product.rating / 5) * 20;

  // Sales popularity (15%)
  score += (product.sales / maxValues.maxSales) * 15;

  // Stock availability (15%)
  let stockScore = 0;
  if (product.stock > 100) stockScore = 15;
  else if (product.stock > 20) stockScore = 10;
  else if (product.stock > 0) stockScore = 5;
  score += stockScore;

  // Price advantage (especially for "cheap" intent)
  let priceScore = 10 * (1 - product.price / maxValues.maxPrice);
  if (parsedQuery.intents.has('cheap')) {
    priceScore *= 2.5;
  }
  score += priceScore;

  // Penalties
  score -= product.returnRate * 12;
  score -= (product.complaints / Math.max(1, product.sales)) * 10;

  // Intent boosts
  if (parsedQuery.intents.has('latest') && product.metadata?.year >= 2024) {
    score += 25;
  }

  return Math.max(0, Math.round(score * 10) / 10);
}

module.exports = {
  calculateScore,
};