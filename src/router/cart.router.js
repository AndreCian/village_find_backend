import express from "express";

import cartModel from "../model/cart.model";
import orderModel from "../model/order.model";
import customerMiddleware from "../middleware/customer.middleware";

const router = express.Router();

router.get("/", /*customerMiddleware,*/ async (req, res) => {
  const { mode, buyerID } = req.query;

  try {
    // const cartItems = await cartModel
    //   .find({
    //     customerId: customer._id,
    //     status: "active",
    //   })
    //   .populate({
    //     path: "vendorId",
    //   })
    //   .populate({
    //     path: "inventoryId",
    //     populate: [
    //       {
    //         path: "productId",
    //       },
    //       {
    //         path: "styleId",
    //       },
    //     ],
    //   });
    const params = { status: 'active' };
    if (mode === 'customer') params.customerId = buyerID;
    else params.guestId = buyerID;
    const cartItems = await cartModel.find(params)
      .populate('vendorId').populate('productId');
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
  // customerMiddleware,
  // uploadMiddleware.single("image"),
  async (req, res) => {
    const { vendorId, productId, price, quantity, discount, image, subscription } = req.body;
    const { mode, buyerID } = req.query;
    try {
      const saveJson = { vendorId, productId, price, quantity, image, discount, subscription, status: 'active', buymode: 'one-time' };
      if (mode === 'customer') {
        saveJson.customerId = buyerID;
      } else {
        saveJson.guestId = buyerID;
      }
      await cartModel.create(saveJson);
      res.send({ status: 200 });
    } catch (err) {
      console.log(err);
    }
  }
);

router.post('/migrate', customerMiddleware, async (req, res) => {
  const { guestId } = req.body;
  const customer = req.customer;

  try {
    const cartItems = await cartModel.find({ guestId });
    console.log(cartItems);
    await Promise.all(cartItems.map(item => {
      item.customerId = customer._id;
      return item.save();
    }));
    return res.send({ status: 200 });
  } catch (err) {
    console.log(err);
  }
})

router.post("/checkout", customerMiddleware, async (req, res) => {
  const { cartItems, donation } = req.body;
  const customer = req.customer;

  try {
    const count = await cartModel.countDocuments();
    await Promise.all(cartItems.map(async (item, index) => {
      const { street, city, state, zipcode } = item.delivery || {};
      let targetAddress = `${street} ${city}, ${state} ${zipcode}`, instruction = item.delivery.instruction || '';
      if (item.gift) {
        const { isHomeDelivery } = item.gift;
        if (isHomeDelivery === false) {
          const { street, city, state, zipcode } = item.gift.delivery;
          targetAddress = `${street} ${city}, ${state} ${zipcode}`;
        }
        instruction = item.gift.delivery.instruction;
      }
      const order = {
        orderID: count + index,
        vendorID: item.vendorId,
        customerID: customer._id,
        deliveryType: item.deliveryType,
        deliveryInfo: {
          orderDate: new Date(),
          classification: item.buymode === 'recurring' ? `Subscription, ${item.deliveryType}` : item.deliveryType,
          address: targetAddress,
          instruction: instruction,
          isSubstitute: false
        },
        product: {
          name: item.productId.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          discount: item.discount,
        }
      };
      if (item.gift) order.gift = item.gift.receiver;
      if (item.personalization) order.personalization = item.personalization.message;
      return orderModel.create(order);
    }));

    await Promise.all((await cartModel.find({ customerId: customer._id, status: 'active' })).map(item => {
      item.status = 'ordered';
      return item.save();
    }))

    res.send({ status: 200 });

    // customer.shipping = shipping;
    // customer.delivery = delivery;
    // customer.donation = donation;
    // await customer.save();

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

    // const cartItems = await cartModel
    //   .find({
    //     customerId: customer._id,
    //     status: "active",
    //   })
    //   .populate({
    //     path: "inventoryId",
    //     populate: [
    //       {
    //         path: "styleId",
    //       },
    //       {
    //         path: "productId",
    //       },
    //     ],
    //   });

    // cartItems.forEach(async (item) => {
    //   await orderModforEachel.create({
    //     orderId: item.orderId,
    //     product: {
    //       name: item.inventoryId.productId.name,
    //       price: item.price,
    //       quantity: item.quantity,
    //       discount: item.inventoryId.styleId.discount,
    //     },
    //     orderInfo: {
    //       isshipping: item.deliveryType === "Shipping",
    //       issubscription: !!item.subscription,
    //       iscsa: !!item.subscription.iscsa,
    //       deliveryType: item.deliveryType,
    //       createdAt: new Date(),
    //       instruction: delivery.instruction,
    //       address:
    //         item.deliveryType === "Pickup Location"
    //           ? item.pickuplocation.address
    //           : delivery.street,
    //       issubstitute: false,
    //       personalization:
    //         (item.personalization && item.personalization.message) || "",
    //     },
    //     customerID: customer._id,
    //     vendorID: item.vendorId,
    //     giftInfo: item.gift.receiver
    //       ? { ...item.gift.receiver, recipient: item.gift.receiver.fullName }
    //       : null,
    //     createdAt: new Date(),
    //     status: "under process",
    //   });
    // });
  } catch (err) {
    console.log(err);
    return res.json({ status: 500 });
  }
});

router.put("/:id", async (req, res) => {
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
    if (subscription) {
      cartItem.subscription = subscription;
      cartItem.buymode = 'recurring';
    }
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
