import { Router } from "express";
import * as mongoose from "mongoose";

import productModel from "../model/product.model";
import vendorMiddleware from "../middleware/vendor.middleware";
import customerMiddleware from "../middleware/customer.middleware";
import upload from "../multer";

const router = Router();
const ObjectId = mongoose.Types.ObjectId;

router.get("/public", async (req, res) => {
  const { community } = req.query;
  const products = await productModel.aggregate([
    {
      $project: {
        name: 1,
        vendor: 1,
      },
    },
    {
      $lookup: {
        from: "vendors",
        localField: "vendor",
        foreignField: "_id",
        as: "vendor",
      },
    },
    {
      $match: {
        "vendor.community": new ObjectId(community),
      },
    },
    {
      $unwind: {
        path: "$vendor",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            {
              _id: "$_id",
              name: "$name",
              shopName: "$vendor.shopName",
            },
          ],
        },
      },
    },
  ]);

  return res.send(products || []);
});

router.get("/customer/:productId", customerMiddleware, async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await productModel.findById(productId);
    return res.json({ status: 200, product });
  } catch (err) {
    console.log(err);
    return res.json({ status: 404 });
  }
});

router.get("/vendor", vendorMiddleware, async (req, res) => {
  const products = await productModel.find().select("name status");
  return res.send(products);
});

router.get("/:id", vendorMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const product = await productModel.findById(id);
    return res.json({ status: 200, product });
  } catch (err) {
    return res.json({ status: 404 });
  }
});

router.get("/:id/:category", vendorMiddleware, async (req, res) => {
  const { id, category } = req.params;
  const product = await productModel.findById(id);

  try {
    if (category === "style") {
      const { styleId } = req.query;
      if (styleId) {
        const style = (product.styles || []).find(
          (item) => item._id.toString() === styleId
        );
        return res.json({ status: 200, style });
      }
      return res.json({ status: 200, styles: product.styles || [] });
    } else if (category === "specification") {
      return res.json({
        status: 200,
        specifications: product.specifications || [],
      });
    } else if (category === "customization") {
      return res.json({
        status: 200,
        customization: product.customization || {},
      });
    }
    return res.json({ status: 200 });
  } catch (err) {
    return res.json({ status: 404 });
  }
});

router.post(
  "/",
  vendorMiddleware,
  upload.single("nutrition"),
  async (req, res) => {
    const vendor = req.vendor;
    try {
      const product = await productModel.create({
        ...req.body,
        vendor: vendor._id,
        //nutrition: req.file.path
      });
      return res.json({ status: 200, product });
    } catch (err) {
      return res.json({ status: 500 });
    }
  }
);

router.post(
  "/:productId/style/image",
  vendorMiddleware,
  upload.array("images"),
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { styleId } = req.query;
      const product = await productModel.findById(productId);
      const style = (product.styles || []).find(
        (item) => item._id.toString() === styleId
      );
      if (!style) {
        return res.json({ status: 404 });
      }

      const images = req.files || [];
      const ids = JSON.parse(req.body.ids) || [];
      const inventories = style.inventories || [];
      // ids.forEach(async (id, index) => {
      //   const inventory = await inventories.find(
      //     (item) => item._id.toString() === id
      //   );
      //   if (!inventory) {
      //     return res.json({ status: 404 });
      //   }
      //   inventory.
      // });
      style.inventories = inventories.map((inventory, index) => {
        const invenID = ids.findIndex(
          (item) => item === inventory._id.toString()
        );
        if (invenID !== -1) {
          return { ...inventory, image: images[invenID].path || "" };
        }
        return inventory;
      });
      console.log(style.inventories);
      await product.save();
      return res.json({ status: 200 });
    } catch (err) {}
  }
);

router.post("/:id/:category", vendorMiddleware, async (req, res) => {
  const { id, category } = req.params;

  try {
    const product = await productModel.findById(id);
    if (category === "attribute") {
      const style = { ...req.body, status: "Inactive" };
      product.styles = [...(product.styles || []), style];

      const result = await product.save();
      const resultStyle = result.styles.find(
        (item) => item.name === style.name
      );
      if (resultStyle) {
        return res.json({ status: 200, attrId: resultStyle._id });
      }
      return res.json({ status: 500 });
    } else if (category === "inventory") {
      const { styleId } = req.query;
      const inventories = req.body;
      product.styles = (product.styles || []).map((style) =>
        style._id.toString() === styleId ? { ...style, inventories } : style
      );
      const savedProduct = await product.save();
      const style = savedProduct.styles.find(
        (item) => item._id.toString() === styleId
      );
      const ids = (style.inventories || []).map((item) => item._id.toString());
      return res.json({ status: 200, ids });
    } else if (category === "specification") {
      const spec = req.body;
      product.specifications = [...(product.specifications || []), spec];
    } else if (category === "customization") {
      const custom = req.body;
      product.customization = custom;
    }
    await product.save();
    return res.json({ status: 200 });
  } catch (err) {
    return res.json({ status: 404 });
  }
});

router.put("/:id", vendorMiddleware, async (req, res) => {
  let data = await productModel.findById(req.params.id);
  data = {
    ...data,
    ...req.body,
  };
  res.send(await productModel.findByIdAndUpdate(req.params.id, data));
});

// router.put("/:id/:category", vendorMiddleware, async (req, res) => {
//   if (category === 'style') {

//   }
// });

router.delete("/:id", vendorMiddleware, async (req, res) => {
  res.send(await productModel.findByIdAndDelete(req.params.id));
});

export default router;
