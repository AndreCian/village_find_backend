import express from "express";

import cartModel from "../model/cart.model";
import orderModel from "../model/order.model";
import customerMiddleware from "../middleware/customer.middleware";

const router = express.Router();

router.get("/", customerMiddleware, async (req, res) => {
  const customer = req.customer;

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
        populate: [
          {
            path: "productId",
          },
          {
            path: "styleId",
          },
        ],
      });
    return res.send(cartItems);
  } catch (err) {
    console.log(err);
    return res.json({ status: 500 });
  }
});

router.get("/count", customerMiddleware, async (req, res) => {
  const customer = req.customer;
  try {
    const count = await cartModel.countDocuments({
      customerId: customer._id,
      status: "active",
    });
    return res.json({ status: 200, count });
  } catch (err) {
    console.log(err);
    return res.json({ status: 500 });
  }
});

router.post(
  "/",
  customerMiddleware,
  // uploadMiddleware.single("image"),
  async (req, res) => {
    const customer = req.customer;
    const {
      inventoryId,
      vendorId,
      price,
      quantity,
      discount,
      personalization,
      subscription,
    } = req.body;
    // const logoFileSrc = req.file;

    try {
      const cartItem = await cartModel.findOne({
        customerId: customer._id,
        inventoryId,
        status: "active",
      });

      if (cartItem) {
        cartItem.quantity += quantity;
        await cartItem.save();
      } else {
        const count = await cartModel.countDocuments();
        await cartModel.create({
          orderId: count + 1,
          customerId: customer._id,
          vendorId,
          inventoryId,
          price,
          quantity,
          discount,
          personalization,
          subscription,
          status: "active",
        });
      }
      return res.json({ status: 200 });
    } catch (err) {
      return res.json({ status: 500 });
    }
  }
);

router.post("/checkout", customerMiddleware, async (req, res) => {
  const { shipping, delivery, donation } = req.body;
  const customer = req.customer;

  try {
    // customer.shipping = shipping;
    // customer.delivery = delivery;
    customer.donation = donation;
    await customer.save();

    // const cartItems = await cartModel
    //   .find({ customerId: customer._id })
    //   .populate({
    //     path: "vendorId",
    //   })
    //   .populate({
    //     path: "inventoryId",
    //     populate: {
    //       path: "productId",
    //     },
    //   });

    // const subscriptions = cartItems.filter((item) => item.subscription);

    // subscriptions.forEach(async (item) => {
    //   const price = await createPrice(item);
    //   await stripePriceModel.create({
    //     cartID: item._id,
    //     priceID: price.id,
    //   });
    // });

    const cartItems = await cartModel
      .find({
        customerId: customer._id,
        status: "active",
      })
      .populate({
        path: "inventoryId",
        populate: [
          {
            path: "styleId",
          },
          {
            path: "productId",
          },
        ],
      });

    cartItems.forEach(async (item) => {
      await orderModforEachel.create({
        orderId: item.orderId,
        product: {
          name: item.inventoryId.productId.name,
          price: item.price,
          quantity: item.quantity,
          discount: item.inventoryId.styleId.discount,
        },
        orderInfo: {
          isshipping: item.deliveryType === "Shipping",
          issubscription: !!item.subscription,
          iscsa: !!item.subscription.iscsa,
          deliveryType: item.deliveryType,
          createdAt: new Date(),
          instruction: delivery.instruction,
          address:
            item.deliveryType === "Pickup Location"
              ? item.pickuplocation.address
              : delivery.street,
          issubstitute: false,
          personalization:
            (item.personalization && item.personalization.message) || "",
        },
        customerID: customer._id,
        vendorID: item.vendorId,
        giftInfo: item.gift.receiver
          ? { ...item.gift.receiver, recipient: item.gift.receiver.fullName }
          : null,
        createdAt: new Date(),
        status: "under process",
      });
    });

    return res.json({ status: 200 });
  } catch (err) {
    console.log(err);
    return res.json({ status: 500 });
  }
});

router.put("/:id", customerMiddleware, async (req, res) => {
  const { id } = req.params;
  const {
    quantity,
    subscription,
    gift,
    deliveryType,
    pickuplocation,
    fulfillday,
  } = req.body;
  try {
    const cartItem = await cartModel.findById(id);
    if (!cartItem) {
      return res.json({ status: 404 });
    }
    if (quantity) cartItem.quantity = quantity;
    if (subscription) cartItem.subscription = subscription;
    if (gift) cartItem.gift = gift;
    if (deliveryType) cartItem.deliveryType = deliveryType;
    if (pickuplocation) cartItem.pickuplocation = pickuplocation;
    if (fulfillday) cartItem.fulfillday = fulfillday;

    await cartItem.save();
    return res.json({ status: 200 });
  } catch (err) {
    console.log(err);
    return res.json({ status: 500 });
  }
});

router.delete("/:id", customerMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await cartModel.findByIdAndDelete(id);
    return res.json({ status: 200 });
  } catch (err) {
    return res.json({ status: 500 });
  }
});

export default router;
