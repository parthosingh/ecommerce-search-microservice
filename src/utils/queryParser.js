const { spellingCorrections } = require('./spellingCorrections');
const { INTENT_KEYWORDS } = require('./constants');

function parseQuery(query) {
  let cleaned = query.toLowerCase().trim();

  // Fix common spellings
  for (const [wrong, correct] of Object.entries(spellingCorrections)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    cleaned = cleaned.replace(regex, correct);
  }

  const tokens = cleaned.split(/\s+/);

  const result = {
    keywords: [],
    intents: new Set(),
    filters: {}
  };

  tokens.forEach(token => {
    // Intents
    if (INTENT_KEYWORDS.cheap.some(k => token.includes(k))) {
      result.intents.add('cheap');
    }
    if (INTENT_KEYWORDS.latest.some(k => token.includes(k))) {
      result.intents.add('latest');
    }

    // Filters
    const colors = ['red', 'blue', 'black', 'white', 'green', 'silver'];
    if (colors.includes(token)) {
      result.filters.color = token;
    }

    if (/\d+gb/i.test(token)) {
      result.filters.storage = token.toUpperCase();
    }

    if (/\d+k/i.test(token)) {
      const num = parseInt(token.replace(/k/i, '')) * 1000;
      result.filters.budget = num;
    } else if (/\d+\s*rupees?/i.test(token)) {
      result.filters.budget = parseInt(token);
    }

    // Keywords (rest)
    if (
      !result.filters.color &&
      !result.filters.storage &&
      !result.filters.budget &&
      !INTENT_KEYWORDS.cheap.some(k => token.includes(k)) &&
      !INTENT_KEYWORDS.latest.some(k => token.includes(k))
    ) {
      result.keywords.push(token);
    }
  });

  return result;
}

module.exports = {
  parseQuery
};