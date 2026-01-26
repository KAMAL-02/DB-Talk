export const dangerousKeywords = [
  "DROP",
  "DELETE",
  "TRUNCATE",
  "ALTER",
  "CREATE",
  "INSERT",
  "UPDATE",
  "GRANT",
  "REVOKE",
  "EXECUTE",
  "EXEC",
  "CROSS",
];
export const STOP_WORDS = new Set([
  "can",
  "you",
  "tell",
  "me",
  "the",
  "of",
  "is",
  "whose",
  "a",
  "an",
  "to",
  "for",
  "with",
  "show",
  "give",
  "get",
  "find",
  "what",
  "if",
  "all",
  "any",
  "and",
  "or",
]);

export const BLOCKED_OPERATORS = new Set([
  "$where",
  "$function",
  "$accumulator",
  "$merge",
  "$out",
]);

export const semanticHints: Record<string, string[]> = {
  user: ["user", "users", "account", "profile", "member", "customer"],
  order: ["order", "orders", "purchase", "transaction"],
  product: ["product", "item"],
  payment: ["payment", "billing"],
};
