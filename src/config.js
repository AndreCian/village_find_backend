export const MONGODB_URI = process.env.MONGODB_URI;
export const HASH_SALT_ROUND = Number(process.env.HASH_SALT_ROUND) || 10;
export const SECRET_KEY = process.env.SECRET_KEY || "abc123";
export const OPENAI_KEY = process.env.OPENAI_KEY || "";
export const ORGANIZATION_ID = process.env.ORGANIZATION_ID || "";
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
export const STRIPE_CLIENT_ID = process.env.STRIPE_CLIENT_ID || "";
export const STRIPE_OAUTH_REDIRECT_URI =
  process.env.STRIPE_OAUTH_REDIRECT_URI || "";
export const STRIPE_OAUTH_SUCCESS_FRONTEND_URI =
  process.env.STRIPE_OAUTH_SUCCESS_FRONTEND_URI || "";
export const STRIPE_CONNECT_WEBHOOK_SIGN =
  process.env.STRIPE_CONNECT_WEBHOOK_SIGN || "";
export const SHIPPO_SECRET_KEY = process.env.SHIPPO_SECRET_KEY || '';
export const SHIPPO_CLIENT_ID = process.env.SHIPPO_CLIENT_ID || "";
export const SHIPPO_STATE_KEY = process.env.SHIPPO_STATE_KEY || "";
export const SHIPPO_OAUTH_REDIRECT_URI = process.env.SHIPPO_OAUTH_REDIRECT_URI || '';
export const FRONTEND_URL = process.env.FRONTEND_URL || "";
