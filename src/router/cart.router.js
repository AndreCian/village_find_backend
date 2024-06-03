import express from "express";

import cartModel from "../model/cart.model";
import orderModel from "../model/order.model";
import customerMiddleware from "../middleware/customer.middleware";

const router = express.Router();

router.get("/", /*customerMiddleware,*/ async (req, res) => {
  const { mode, buyerID } = req.query;

  try {
    const params = { status: 'active' };
    if (mode === 'customer') params.customerId = buyerID;
    else params.guestId = buyerID;
    const cartItems = await cartModel.find(params)
      .populate([
        { path: 'vendorId' },
        { path: 'productId' }
      ]);
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
      const maxOrderID = await cartModel.findOne().sort({ orderId: -1 });
      const saveJson = {
        orderId: maxOrderID ? maxOrderID.orderId + 1 : 1,
        vendorId,
        productId,
        price,
        quantity,
        image,
        discount,
        subscription,
        status: 'active',
        buymode: 'one-time'
      };
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
      const { deliveryType, delivery } = item;
      let targetAddress = '', instruction = '';
      if (deliveryType === 'Shipping' || deliveryType === 'Home Delivery') {
        const { street, city, state, zipcode } = item.delivery || {};
        instruction = delivery.instruction;
        targetAddress = `${street} ${city}, ${state} ${zipcode}`;
      } else if (deliveryType === 'Pickup Location') {
        instruction = item.pickuplocation.instruction;
        targetAddress = item.pickuplocation.address;
      }
      const order = {
        orderID: count + index,
        vendorID: item.vendorId,
        customerID: customer._id,
        deliveryType: item.deliveryType,
        deliveryInfo: {
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
          soldByUnit: item.productId.soldByUnit,
          subtotal: Math.floor((item.price * item.quantity) * (100 - item.discount) / 100)
        },
        orderDate: new Date(),
      };
      if (item.gift) order.gift = item.gift.receiver;
      if (item.personalization) order.personalization = item.personalization.message;
      if (item.deliveryType === 'Pickup Location') {
        const { pickupDate, pickupTime } = item.pickuplocation;
        order.locationInfo = {
          ...item.pickuplocation, pickDate: pickupDate, pickTime: `${pickupTime.from} ${pickupTime.to}`
        }
      };
      return orderModel.create(order);
    }));

    await Promise.all((await cartModel.find({ customerId: customer._id, status: 'active' })).map(item => {
      item.status = 'ordered';
      return item.save();
    }))

    res.send({ status: 200 });
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

router.delete("/:id", /*customerMiddleware,*/ async (req, res) => {
  const { id } = req.params;
  try {
    await cartModel.findByIdAndDelete(id);
    return res.json({ status: 200 });
  } catch (err) {
    return res.json({ status: 500 });
  }
});

export default router;
