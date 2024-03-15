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
    return_url: `${FRONTEND_URL}/vendor/profile/bank-detail`,
  });

  return accountLink;
};

export const webhookHandler = (request, response) => {
  const sig = request.headers["stripe-signature"];

  let event;

  // Verify webhook signature and extract the event.
  // See https://stripe.com/docs/webhooks#verify-events for more information.
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
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

  response.json({ received: true });
};
