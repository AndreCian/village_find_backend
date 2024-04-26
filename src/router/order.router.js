import express from "express";

import orderModel from "../model/order.model";
import vendorMiddleware from "../middleware/vendor.middleware";

const router = express.Router();

// router.get("/vendor", vendorMiddleware, async (req, res) => {
//   const vendor = req.vendor;
//   try {
//     const orders = await orderModel
//       .find({
//         vendorID: vendor._id,
//       })
//       .populate([
//         {
//           path: "customerID",
//         },
//         {
//           path: "vendorID",
//         },
//       ]);
//     return res.send(orders);
//   } catch (err) {
//     console.log(err);
//     return res.json({ status: 500 });
//   }
// });

// router.get("/vendor/:id", vendorMiddleware, async (req, res) => {
//   const vendor = req.vendor;
//   const { id } = req.params;
//   try {
//     const order = await orderModel.findById(id);
//     return res.json({ status: 200, order });
//   } catch (err) {
//     console.log(err);
//     return res.json({ status: 500 });
//   }
// });

// router.put("/vendor/:id", vendorMiddleware, async (req, res) => {
//   const vendor = req.vendor;
//   const { id } = req.params;
//   try {
//     const { status } = req.body;
//     const order = await orderModel.findById(id);
//     if (status) order.status = status;
//     await order.save();
//     return res.json({ status: 200 });
//   } catch (err) {
//     console.log(err);
//     return res.json({ status: 500 });
//   }
// });

router.get("/vendor", vendorMiddleware, async (req, res) => {
  try {
    const vendor = req.vendor;
    const orders = await orderModel.find({
      vendorID: vendor._id,
    });
    return res.send(orders);
  } catch (err) {
    throw new Error(err);
  }
});

router.get("/vendor/:id", vendorMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderModel.findById(id);
    return res.send(order);
  } catch (err) {
    throw new Error(err);
  }
});

router.post("/vendor", async (req, res) => {
  await orderModel.create(req.body);
  return res.send({ status: 200 });
});

export default router;
