import stripe from "stripe";
import express from "express";

import {
  STRIPE_SECRET_KEY,
  STRIPE_CONNECT_WEBHOOK_ENDPOINT_KEY,
  FRONTEND_URL,
} from "../config";

const router = express.Router();
const stripeClient = new stripe(STRIPE_SECRET_KEY);

export const connectStripe = async (accId) => {
  console.log("Stripe connecting part...", accId);
  let accountId = accId;
  if (!accountId) {
    const account = await stripeClient.accounts.create({
      type: "express",
    });
    accountId = account.id;
  }
  console.log("Account Id...", accountId);
  const accountLink = await stripeClient.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${FRONTEND_URL}`,
    return_url: `${FRONTEND_URL}/vendor/profile/bank-detail?acc_id=${accountId}`,
  });

  return {
    url: accountLink.url,
    accountId,
  };
};

router.post(
  "/connect",
  express.json({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    console.log("Stripe Connect Webhook");

    let event;
    const endpointSecret = STRIPE_CONNECT_WEBHOOK_ENDPOINT_KEY;

    // Verify webhook signature and extract the event.
    // See https://stripe.com/docs/webhooks#verify-events for more information.
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      console.log(err);
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "account.updated":
        const accountUpdated = event.data.object;
        console.log(accountUpdated);
        // Then define and call a function to handle the event account.updated
        break;
      case "account.application.authorized":
        const accountApplicationAuthorized = event.data.object;
        // Then define and call a function to handle the event account.application.authorized
        break;
      case "account.application.deauthorized":
        const accountApplicationDeauthorized = event.data.object;
        // Then define and call a function to handle the event account.application.deauthorized
        break;
      case "account.external_account.created":
        const accountExternalAccountCreated = event.data.object;
        // Then define and call a function to handle the event account.external_account.created
        break;
      case "account.external_account.deleted":
        const accountExternalAccountDeleted = event.data.object;
        // Then define and call a function to handle the event account.external_account.deleted
        break;
      case "account.external_account.updated":
        const accountExternalAccountUpdated = event.data.object;
        // Then define and call a function to handle the event account.external_account.updated
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return response.json({ received: true });
  }
);

export default router;
