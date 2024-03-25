import express from "express";
import mongoose from "mongoose";

import cartModel from "../model/cart.model";
import customerMiddleware from "../middleware/customer.middleware";
import uploadMiddleware from "../multer";

const router = express.Router();
const ObjectId = mongoose.Types.ObjectId;

router.get("/", customerMiddleware, async (req, res) => {
  const customer = req.customer;

  try {
    const orders = await cartModel.aggregate([
      {
        $match: {
          customerId: new ObjectId(customer._id),
          status: "active",
        },
      },
      {
        $lookup: {
          from: "inventories",
          localField: "inventoryId",
          foreignField: "_id",
          as: "inventory",
        },
      },
      {
        $unwind: "$inventory",
      },
      {
        $lookup: {
          from: "products",
          localField: "inventory.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "styles",
          localField: "inventory.styleId",
          foreignField: "_id",
          as: "style",
        },
      },
      {
        $unwind: "$style",
      },
      {
        $project: {
          cartId: "$_id",
          orderId: "$orderId",
          vendorId: "$vendorId",
          image: "$inventory.image",
          name: "$product.name",
          price: "$price",
          quantity: "$quantity",
          attrValues: "$inventory.attrs",
          attrModels: "$style.attributes",
          soldByUnit: "$product.soldByUnit",
          personalization: {
            fee: "$personFee",
            message: "$personMessage",
          },
          deliveryTypes: "$product.deliveryTypes",
        },
      },
      {
        $group: {
          _id: { orderId: "$orderId", vendorId: "$vendorId" },
          products: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $unset: ["products.orderId", "products.vendorId"],
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$_id", { products: "$products" }],
          },
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendor",
          pipeline: [{ $project: { shopName: 1 } }],
        },
      },
      {
        $unwind: "$vendor",
      },
      {
        $project: { vendorId: 0 },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ shopName: "$vendor.shopName" }, "$$ROOT"],
          },
        },
      },
      {
        $addFields: {
          orderTotalPrice: {
            $reduce: {
              input: "$products",
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  { $multiply: ["$$this.price", "$$this.quantity"] },
                ],
              },
            },
          },
        },
      },
    ]);
    return res.send({ status: 200, orders });
  } catch (err) {
    console.log(err);
    return res.json({ status: 500 });
  }
});

router.post(
  "/",
  customerMiddleware,
  uploadMiddleware.single("image"),
  async (req, res) => {
    const customer = req.customer;
    const {
      inventoryId,
      vendorId,
      quantity,
      isPersonalized,
      personFee,
      personMessage,
    } = req.body;
    const logoFileSrc = req.file;

    try {
      const cartItem = await cartModel.findOne({
        inventoryId,
        customerId: customer._id,
        status: "active",
      });
      if (cartItem) {
        return res.json({ status: 400 });
      }

      const cartItems = await cartModel.aggregate([
        {
          $match: {
            customerId: new ObjectId(customer._id),
            vendorId: new ObjectId(vendorId),
            status: "active",
          },
        },
        {
          $project: {
            orderId: "$orderId",
          },
        },
      ]);
      const totalOrders = await cartModel.aggregate([
        {
          $match: {
            status: "active",
          },
        },
        {
          $group: {
            _id: { customerId: "$customerId", orderId: "$orderId" },
          },
        },
        { $count: "count" },
      ]);

      const maxOrderId =
        cartItems.length > 0
          ? cartItems[0].orderId
          : (totalOrders[0]?.count || 0) + 1;
      const payload = {
        orderId: maxOrderId,
        customerId: customer._id,
        inventoryId,
        vendorId,
        quantity,
        isPersonalized,
        personFee,
        personMessage,
        orderLogoPath: (logoFileSrc && logoFileSrc.path) || "",
        status: "active",
      };

      await cartModel.create(payload);
      return res.json({ status: 200 });
    } catch (err) {
      console.log(err);
      return res.json({ status: 500 });
    }
  }
);

router.put("/:id", customerMiddleware, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
    const cartItem = await cartModel.findById(id);
    if (!cartItem) {
      return res.json({ status: 404 });
    }
    cartItem.quantity = quantity;
    await cartItem.save();
    return res.json({ status: 200 });
  } catch (err) {
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
