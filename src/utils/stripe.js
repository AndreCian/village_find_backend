import stripe from "stripe";
import express from "express";

import {
  STRIPE_SECRET_KEY,
  STRIPE_CONNECT_WEBHOOK_SIGN,
  FRONTEND_URL,
} from "../config";
import cartModel from "../model/cart.model";
import paymentIntentModel from "../model/paymentintent.model";
import customerMiddleware from "../middleware/customer.middleware";
import stripeAccountModel from "../model/stripeaccount.model";
import stripeCustomerModel from "../model/stripecustomer.model";
import vendorModel from "../model/vendor.model";
import customerModel from "../model/customer.model";

const router = express.Router();
const stripeClient = new stripe(STRIPE_SECRET_KEY);

const connectStripe = async (vendor) => {
  try {
    let accountId = vendor.stripeAccountID;
    if (!accountId) {
      const stripeAccount = await stripeAccountModel.findOne({
        vendorID: vendor._id,
      });
      if (!stripeAccount) {
        const account = await stripeClient.accounts.create({
          type: "express",
        });
        accountId = account.id;
        await stripeAccountModel.create({
          vendorID: vendor._id,
          stripeAccountID: account.id,
        });
      } else {
        accountId = stripeAccount.stripeAccountID;
      }
    }
    const accountLink = await stripeClient.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      refresh_url: `${FRONTEND_URL}`,
      return_url: `${FRONTEND_URL}/vendor/profile/bank-detail?accountID=${accountId}`,
    });

    return {
      url: accountLink.url,
      id: accountId,
    };
  } catch (err) {
    console.log(err);
  }
};

const createCustomer = async (
  customer,
  connectedAccountID,
  paymentMethodID
) => {
  const checkCustomer = await stripeCustomerModel.findOne({
    customerID: customer._id,
    vendorConnectedID: connectedAccountID,
    paymentMethodID,
  });
  if (!checkCustomer) {
    const stripeCustomer = await stripeClient.customers.create(
      {
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone,
      },
      { stripeAccount: connectedAccountID }
    );
    await stripeCustomerModel.create({
      customerID: customer._id,
      vendorConnectedID: connectedAccountID,
      paymentMethodID,
      stripeCustomerID: platformCustomer.id,
    });
    return stripeCustomer;
  } else {
    const stripeCustomer = await stripeClient.customers.retrieve(
      checkCustomer.stripeCustomerID,
      { stripeAccount: connectedAccountID }
    );
    // await attachPaymentMethod(
    //   connectedAccountID,
    //   paymentMethodID,
    //   stripeCustomer.id
    // );
    return stripeCustomer;
  }
};

const createTransfer = async (
  amount,
  applicationFeePercent,
  connectedAccountID
) => {
  console.log("---------------Application Fee Percent", applicationFeePercent);
  try {
    const transfer = await stripeClient.transfers.create({
      amount: parseInt(amount * (100 - applicationFeePercent)),
      currency: "usd",
      destination: connectedAccountID,
    });
    return transfer;
  } catch (err) {
    console.log(err);
  }
};

const createPrice = async (cart, connectedAccountID) => {
  return await stripeClient.prices.create(
    {
      unit_amount: parseInt(
        cart.price * cart.quantity * (cart.subscription.duration || 1) * 100
      ),
      currency: "usd",
      recurring: {
        interval: cart.subscription.frequency.unit,
        interval_count: cart.subscription.frequency.interval,
      },
      product_data: {
        name: cart.inventoryId.productId.name,
        metadata: {
          category: cart.inventoryId.productId.category,
        },
      },
    },
    { stripeAccount: connectedAccountID }
  );
};

const createSubscription = async (
  customerId,
  priceId,
  connectedAccountId,
  applicationFeePercent
) => {
  try {
    console.log("-------------------Customer ID", customerId);
    const subscription = await stripeClient.subscriptions.create(
      {
        customer: customerId,
        items: [{ price: priceId }],
        application_fee_percent: applicationFeePercent, // For a percentage fee
        // or
        // application_fee_amount: applicationFeeAmount, // For a fixed amount fee
        expand: ["latest_invoice.payment_intent"],
      },
      {
        stripeAccount: connectedAccountId, // This header is used for making a request on behalf of a connected account
      }
    );

    return subscription;
  } catch (err) {
    console.error("Failed to create subscription:", err);
    // Handle errors appropriately in your app
  }
};

const attachPaymentMethod = async (
  connectedAccountID,
  paymentMethodID,
  customerID
) => {
  await stripeClient.paymentMethods.attach(paymentMethodID, {
    customer: customerID,
  });
  await stripeClient.customers.update(
    customerID,
    {
      invoice_settings: {
        default_payment_method: paymentMethodID,
      },
    },
    { stripeAccount: connectedAccountID }
  );
};

const fulfillOrders = async (customerID) => {
  try {
    const cartItems = await cartModel
      .find({
        customerId: customerID,
        status: "active",
      })
      .populate({
        path: "vendorId",
      })
      .populate({
        path: "inventoryId",
        populate: {
          path: "productId",
        },
      });
    const customer = await customerModel.findById(customerID);

    const subscriptions = cartItems.filter(
      (item) => item.subscription.issubscribed
    );
    const regularItems = cartItems.filter(
      (item) => !item.subscription.issubscribed
    );

    // regularItems.forEach(async (item) => {
    //   createTransfer(
    //     item.price * item.quantity,
    //     item.vendorId.commission,
    //     item.vendorId.stripeAccountID
    //   );
    // });
    subscriptions.forEach(async (item) => {
      const price = await createPrice(item, item.vendorId.stripeAccountID);
      const stripeCustomer = await createCustomer(
        customer,
        item.vendorId.stripeAccountID
      );
      const subscription = await createSubscription(
        stripeCustomer.id,
        price.id,
        item.vendorId.stripeAccountID,
        item.vendorId.commission
      );
    });
  } catch (err) {
    console.log(err);
  }
};

router.post(
  "/create-payment-method",
  customerMiddleware,
  express.json(),
  async (req, res) => {
    const customer = req.customer;
    const { methodID } = req.body;

    try {
      const cartItems = await cartModel
        .find({
          customerId: customer._id,
          status: "active",
        })
        .populate({
          path: "vendorId",
        })
        .populate({
          path: "inventoryId",
          populate: {
            path: "productId",
          },
        });
      cartItems.forEach(async (item) => {
        const customer = await createCustomer(
          item,
          item.vendorId.stripeAccountID,
          methodID
        );
        item.stripeCustomerID = customer.id;
        await item.save();
      });
    } catch (error) {
      console.log(error);
      return res.json({ status: 400 });
    }
  }
);

router.post(
  "/webhook/connect",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    console.log("Stripe Connect Webhook");

    let event;
    const endpointSecret = STRIPE_CONNECT_WEBHOOK_SIGN;

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
        const stripeAccount = await stripeAccountModel.findOne({
          stripeAccountID: accountUpdated.id,
        });
        if (stripeAccount) {
          const vendor = await vendorModel.findById(stripeAccount.vendorID);
          vendor.stripeAccountID = stripeAccount.stripeAccountID;
          await vendor.save();
        }
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
      case "payment_intent.succeeded":
        {
          console.log("payment intent succeeded");
          // Then define and call a function to handle the successful payment intent.
        }
        break;
      case "charge.succeeded":
        console.log("charge succeeded");
        const intent = event.data.object;
        const paymentIntent = await paymentIntentModel.findOne({
          paymentIntentID: intent.payment_intent,
        });
        console.log(paymentIntent);
        paymentIntent.paymentMethod = intent.payment_method;
        await paymentIntent.save();
        await fulfillOrders(
          paymentIntent.customerID,
          intent.payment_method_details.card,
          intent.billing_details
        );
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return response.json({ received: true });
  }
);

export {
  connectStripe,
  createCustomer,
  createPrice,
  createTransfer,
  createSubscription,
};
export default router;
