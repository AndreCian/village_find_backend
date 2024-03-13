import { STRIPE_SECRET_KEY, FRONTEND_URL } from "../config";
import stripe from "stripe";

const stripeClient = new stripe(STRIPE_SECRET_KEY);

export const connectOnboard = async () => {
  const account = await stripeClient.accounts.create({
    type: "express",
  });
  const accountLink = await stripeClient.accountLinks.create({
    account: account.id,
    type: "account_onboarding",
    refresh_url: `${FRONTEND_URL}`,
    return_url: `${FRONTEND_URL}`,
  });

  return accountLink;
};
