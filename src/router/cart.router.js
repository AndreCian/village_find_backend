import express from "express";
import mongoose from "mongoose";

import cartModel from "../model/cart.model";
import customerMiddleware from "../middleware/customer.middleware";

const router = express.Router();
const ObjectId = mongoose.Types.ObjectId;

router.get("/", customerMiddleware, async (req, res) => {
  const customerId = req.customer;

  try {
    const cartItems = await cartModel.aggregate([
      {
        $match: {
          customerId: new ObjectId(customerId),
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $group: {
          _id: "$product.vendor",
          products: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "_id",
          foreignField: "_id",
          as: "vendor",
        },
      },
      {
        $unwind: "$vendor",
      },
      {
        $project: {
          "products.product": 1,
          "products.quantity": 1,
          vendor: 1,
        },
      },
    ]);
    return res.json({ status: 200, cartItems });
  } catch (err) {
    console.log(err);
    return res.json({ status: 404 });
  }
});

router.post("/", async (req, res) => {
  try {
    const cartItem = await cartModel.create({ ...req.body });
    return res.json({ status: 200 });
  } catch (err) {
    return res.json({ status: 500 });
  }
});

export default router;
