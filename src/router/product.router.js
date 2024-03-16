import { Router } from "express";
import * as mongoose from "mongoose";

import productModel from "../model/product.model";
import vendorMiddleware from "../middleware/vendor.middleware";
import upload from "../multer";

const router = Router();
const ObjectId = mongoose.Types.ObjectId;

// router.get("/", vendorMiddleware, async (req, res) => {
//   const { id, community } = req.query;
//   if (id) {
//     try {
//       const product = await productModel.findOne({ _id: id }).select("name");
//       res.json({ status: 200, product });
//     } catch (err) {
//       res.json({ status: 404 });
//     }
//   } else if (community) {
//     const products = await productModel.aggregate([
//       {
//         $lookup: {
//           from: "vendors",
//           localField: "vendor",
//           foreignField: "_id",
//           as: "vendor",
//         },
//       },
//       {
//         $match: {
//           "vendor.community": community,
//         },
//       },
//     ]);
//     return res.send(products);
//   } else {
//     res.send(await productModel.find({ vendor: req.vendor._id }));
//   }
// });

// router.get('/vendor', )

router.get("/public", async (req, res) => {
  const { community } = req.query;
  console.log(community);
  const products = await productModel.aggregate([
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
      $project: {
        name: 1,
        vendor: 1,
      },
    },
    {
      $unwind: {
        path: "$vendor",
      },
    },
    {
      $replaceWith: {
        $mergeObjects: ["$$ROOT", "$vendor"],
      },
    },
    {
      $project: {
        name: 1,
        shopName: 1,
      },
    },
  ]);
  console.log(products);

  return res.send(products || []);
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
    res.send(
      await productModel.create({
        ...req.body,
        vendor: vendor._id,
        //nutrition: req.file.path
      })
    );
  }
);

router.post("/:id/:category", vendorMiddleware, async (req, res) => {
  const { id, category } = req.params;

  try {
    const product = await productModel.findById(id);
    if (category === "style") {
      const style = { ...req.body, status: "Inactive" };
      product.styles = [...(product.styles || []), style];
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
