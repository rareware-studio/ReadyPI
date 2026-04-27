/**
 * Token counting utility
 * Uses rough estimation for now, can integrate tiktoken for precise counting
 */

/**
 * Count tokens in messages array
 * Rough estimation: ~4 characters = 1 token
 */
function countTokens(messages) {
  if (!Array.isArray(messages)) {
    return 0;
  }

  let totalChars = 0;

  for (const message of messages) {
    if (message.content) {
      totalChars += message.content.length;
    }
    if (message.role) {
      totalChars += message.role.length;
    }
    // Add overhead for message structure
    totalChars += 10;
  }

  // Rough conversion: 4 chars ≈ 1 token
  return Math.ceil(totalChars / 4);
}

/**
 * Count tokens in a single text string
 */
function countTextTokens(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  return Math.ceil(text.length / 4);
}

/**
 * Estimate cost in BDT for given tokens and model
 */
function estimateCost(tokens, costPer1MTokens) {
  return (tokens / 1000000) * costPer1MTokens;
}

/**
 * Convert tokens to credits (1 credit = 1000 tokens)
 */
function tokensToCredits(tokens) {
  return Math.ceil(tokens / 1000);
}

/**
 * Convert credits to tokens
 */
function creditsToTokens(credits) {
  return credits * 1000;
}

module.exports = {
  countTokens,
  countTextTokens,
  estimateCost,
  tokensToCredits,
  creditsToTokens
};
