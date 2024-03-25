import express from "express";

import inventoryModel from "../model/inventory.model";
import styleModel from "../model/style.model";

import customerMiddleware from "../middleware/customer.middleware";
import vendorMiddleware from "../middleware/vendor.middleware";

const router = express.Router();

router.get(
  "/customer",
  /*customerMiddleware,*/ async (req, res) => {
    const { productId } = req.query;
    const styles = await styleModel
      .find({ productId })
      .populate("inventories")
      .select("-productId");
    return res.json({ status: 200, styles });
  }
);

router.get("/vendor", vendorMiddleware, async (req, res) => {
  const { productId } = req.query;
  const styles = await styleModel
    .find({ productId })
    .select("-productId -inventories");

  return res.json({ status: 200, styles });
});

router.get("/:id", vendorMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const style = await styleModel.findById(id).populate("inventories");
    return res.json({ status: 200, style });
  } catch (err) {
    return res.json({ status: 500 });
  }
});

router.post("/", vendorMiddleware, async (req, res) => {
  const { productId } = req.query;
  const { name, attributes } = req.body;

  try {
    const style = await styleModel.create({
      productId,
      name,
      attributes,
    });
    return res.json({ status: 200, styleId: style._id });
  } catch (err) {
    return res.json({ status: 500 });
  }
});

router.put("/:id", vendorMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, attributes } = req.body;

  try {
    await styleModel.findByIdAndUpdate(id, { name, attributes });
    return res.json({ status: 200 });
  } catch (err) {
    return res.json({ status: 500 });
  }
});

router.put("/:id/discount", vendorMiddleware, async (req, res) => {
  const { id } = req.params;
  const { discount } = req.body;

  try {
    const style = await styleModel.findById(id);
    style.discount = discount;
    await style.save();

    return res.json({ status: 200 });
  } catch (err) {
    return res.json({ status: 500 });
  }
});

router.put("/:id/inventory", vendorMiddleware, async (req, res) => {
  const { id } = req.params;
  const inventories = req.body || [];

  try {
    const style = await styleModel.findById(id).populate("inventories");
    const styleInvents = style.inventories || [];

    const invents = await Promise.all(
      inventories.map((inventory, inventIndex) => {
        return new Promise((resolve, reject) => {
          const styleInvent = styleInvents[inventIndex];
          if (!styleInvent) {
            inventoryModel
              .create({
                styleId: style._id,
                product: style.productId,
                ...inventory,
              })
              .then((invent) => {
                resolve(invent);
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            inventoryModel
              .findByIdAndUpdate(styleInvent._id, inventory)
              .then((invent) => resolve(invent))
              .catch((err) => reject(err));
          }
        });
      })
    );

    const savingJson = invents.map((invent) => invent._id);
    const rawStyle = await styleModel.findById(id);
    rawStyle.inventories = savingJson;

    await rawStyle.save();
    return res.json({ status: 200, ids: savingJson });
  } catch (err) {
    console.log(err);
    return res.json({ status: 500 });
  }
});

export default router;
