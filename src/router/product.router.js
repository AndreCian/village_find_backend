import { Router } from "express";
import * as mongoose from "mongoose";

import productModel from "../model/product.model";

import vendorMiddleware from "../middleware/vendor.middleware";
import uploadMiddleware from "../multer";

const router = Router();
const ObjectId = mongoose.Types.ObjectId;

router.get("/public", async (req, res) => {
  const {
    community,
    vendor,
    type,
    search,
    category,
    sort,
    minPrice,
    maxPrice,
    featured,
  } = req.query;

  const filter = {
    $or: [
      { name: { $regex: search || "", $options: "i" } },
      { "vendor.shopName": { $regex: search || "", $options: "i" } },
    ],
  };
  if (community) filter["vendor.community"] = new ObjectId(community);
  if (vendor) filter["vendor._id"] = new ObjectId(vendor);
  if (category) filter.category = category;
  if (minPrice) filter["inventories.price"] = { $gte: Number(minPrice) };
  if (maxPrice) filter["inventories.price"] = { $lte: Number(maxPrice) };

  const products = await productModel.aggregate([
    ...(type === "subscription"
      ? [{ $match: { subscription: { $ne: null } } }]
      : []),
    {
      $lookup: {
        from: "inventories",
        localField: "_id",
        foreignField: "productId",
        as: "inventories",
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
      $match: filter,
    },
    ...(featured ? [{ $limit: 8 }] : []),
    {
      $sort: ["ascending", "descending"].includes(sort)
        ? {
            name: sort === "ascending" ? 1 : -1,
          }
        : { createdAt: 1 },
    },
    {
      $addFields: {
        inventory: {
          $first: {
            $filter: {
              input: "$inventories",
              as: "inventory",
              cond: {
                $ne: ["$$inventory.image", null],
              },
            },
          },
        },
        vendor: {
          $first: "$vendor",
        },
      },
    },
    {
      $addFields: {
        tags: {
          $cond: {
            if: {
              $in: ["Local Subscriptions", "$deliveryTypes"],
            },
            then: ["Subscription", "Near By"],
            else: {
              $cond: {
                if: {
                  $in: ["Near By", "$deliveryTypes"],
                },
                then: ["Near By"],
                else: {
                  $cond: {
                    if: {
                      $ne: ["$subscription", null],
                    },
                    then: ["Subscription"],
                    else: [],
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            {
              _id: "",
              category: "",
              name: "",
              shopName: "",
              price: 0,
              image: "",
              tags: [],
            },
            {
              _id: "$_id",
              category: "$category",
              name: "$name",
              shopName: "$vendor.shopName",
              price: "$inventory.price",
              image: "$inventory.image",
              tags: "$tags",
            },
          ],
        },
      },
    },
  ]);
  return res.send(products);
});

router.get("/vendor", vendorMiddleware, async (req, res) => {
  const vendor = req.vendor;
  const { name, sortBy, id, sku } = req.query;
  const nameAndIdFilter = {
    name: {
      $regex: name || "",
      $options: "i",
    },
    id: {
      $regex: id || "",
      $options: "i",
    },
  };
  const skuFilter = {
    sku: {
      $regex: sku || "",
      $options: "i",
    },
  };
  const sort = {};
  if (sortBy === "newest") {
    sort.createdAt = -1;
  } else if (sortBy === "oldest") {
    sort.createdAt = 1;
  } else if (sortBy === "active") {
    sort.status = 1;
  } else if (sortBy === "inactive") {
    sort.status = -1;
  }
  const products = await productModel.aggregate([
    {
      $match: {
        vendor: new ObjectId(vendor._id),
      },
    },
    { $match: nameAndIdFilter },
    {
      $project: {
        name: 1,
        status: 1,
        specification: {
          $first: {
            $filter: {
              input: "$specifications",
              as: "specification",
              cond: {
                $eq: ["$$specification.name", "sku"],
              },
            },
          },
        },
        createdAt: 1,
      },
    },
    {
      $lookup: {
        from: "inventories",
        localField: "_id",
        foreignField: "productId",
        as: "inventories",
      },
    },
    {
      $addFields: {
        inventory: {
          $first: {
            $filter: {
              input: "$inventories",
              as: "inventory",
              cond: {
                $ne: ["$$inventory.image", null],
              },
            },
          },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            {
              _id: "",
              name: "",
              status: "",
              image: "",
              sku: "",
              createdAt: "",
            },
            {
              _id: "$_id",
              name: "$name",
              status: "$status",
              image: "$inventory.image",
              sku: "$specification.value",
              createdAt: "$createdAt",
            },
          ],
        },
      },
    },
    { $match: skuFilter },
    { $sort: sort },
  ]);

  return res.send(products);
});

router.get("/vendor/:id", vendorMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const product = await productModel.findById(id);
    return res.json({ status: 200, product });
  } catch (err) {
    return res.json({ status: 404 });
  }
});

router.get(
  "/customer/:id",
  /*customerMiddleware,*/ async (req, res) => {
    const { id } = req.params;
    try {
      const products = await productModel.aggregate([
        {
          $match: {
            _id: new ObjectId(id),
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
          $lookup: {
            from: "communities",
            localField: "vendor.community",
            foreignField: "_id",
            as: "community",
          },
        },
        {
          $lookup: {
            from: "styles",
            localField: "_id",
            foreignField: "productId",
            as: "styles",
          },
        },
        {
          $unwind: "$vendor",
        },
        {
          $unwind: "$community",
        },
        {
          $addFields: {
            inventories: {
              $reduce: {
                input: "$styles",
                initialValue: [],
                in: {
                  $concatArrays: ["$$value", "$$this.inventories"],
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "inventories",
            localField: "inventories",
            foreignField: "_id",
            as: "inventories",
          },
        },
        {
          $project: {
            name: "$name",
            more: {
              shortDesc: "$shortDesc",
              longDesc: "$longDesc",
              disclaimer: "$disclaimer",
              specifications: "$specifications",
            },
            vendor: {
              _id: 1,
              shopName: 1,
            },
            community: {
              _id: 1,
              name: 1,
              slug: 1,
              "images.logoUrl": 1,
            },
            styles: 1,
            inventories: {
              _id: 1,
              attrs: 1,
              image: 1,
              price: 1,
            },
            customization: 1,
            subscription: 1,
            soldByUnit: 1,
            deliveryTypes: 1,
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  more: "$more",
                  order: {
                    name: "$name",
                    vendor: "$vendor",
                    community: "$community",
                    styles: "$styles",
                    inventories: "$inventories",
                    customization: "$customization",
                    subscription: "$subscription",
                    soldByUnit: "$soldByUnit",
                    deliveryTypes: "$deliveryTypes",
                  },
                },
              ],
            },
          },
        },
      ]);
      if (products.length === 1) {
        return res.json({ status: 200, product: products[0] });
      }
      return res.json({ status: 404 });
    } catch (err) {
      console.log(err);
      return res.json({ status: 500 });
    }
  }
);

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
    } else if (category === "subscription") {
      return res.json({ status: product.subscription });
    }
    return res.json({ status: 200 });
  } catch (err) {
    return res.json({ status: 404 });
  }
});

router.post(
  "/",
  vendorMiddleware,
  uploadMiddleware.single("nutrition"),
  async (req, res) => {
    const vendor = req.vendor;
    const reqJson = req.body;
    try {
      const totalCount = await productModel.countDocuments();
      const product = await productModel.create({
        ...reqJson,
        deliveryTypes: JSON.parse(reqJson.deliveryTypes),
        vendor: vendor._id,
        nutrition: req.file.path,
        status: "inactive",
        id: `${totalCount + 1}`,
      });
      if (!vendor.isProduct) vendor.isProduct = true;
      await vendor.save();
      return res.json({ status: 200, product });
    } catch (err) {
      return res.json({ status: 500 });
    }
  }
);

router.post("/:id/:category", vendorMiddleware, async (req, res) => {
  const { id, category } = req.params;

  try {
    const product = await productModel.findById(id);
    if (category === "specification") {
      const spec = req.body;
      const { specId } = req.query;
      const specifications = product.specifications;
      if (specifications.find((item) => item._id.toString() === specId)) {
        product.specifications = specifications.map((item) =>
          item._id.toString() === specId ? { ...item, ...spec } : item
        );
      } else {
        product.specifications = [...specifications, spec];
      }
    } else if (category === "customization") {
      const custom = req.body;
      product.customization = custom;
    } else if (category === "subscription") {
      const subscribe = req.body;
      product.subscription = subscribe;
    }
    await product.save();
    return res.json({ status: 200 });
  } catch (err) {
    return res.json({ status: 404 });
  }
});

router.put(
  "/:id",
  vendorMiddleware,
  uploadMiddleware.single("nutrition"),
  async (req, res) => {
    const { id } = req.params;
    const {
      name,
      deliveryTypes,
      category,
      status,
      shortDesc,
      longDesc,
      disclaimer,
      soldByUnit,
      tax,
    } = req.body;
    console.log(deliveryTypes);

    try {
      const product = await productModel.findById(id);
      if (name) product.name = name;
      if (deliveryTypes) product.deliveryTypes = JSON.parse(deliveryTypes);
      if (category) product.category = category;
      if (shortDesc) product.shortDesc = shortDesc;
      if (longDesc) product.longDesc = longDesc;
      if (disclaimer) product.disclaimer = disclaimer;
      if (soldByUnit) product.soldByUnit = soldByUnit;
      if (tax) product.tax = tax;
      if (req.file) product.nutrition = req.file.path;
      if (!!status) product.status = status;
      await product.save();
      return res.json({ status: 200 });
    } catch (err) {
      console.error(err);
      return res.json({ status: 500 });
    }
  }
);

router.put("/:id/:category", vendorMiddleware, async (req, res) => {
  const { id, category } = req.params;

  try {
    const product = await productModel.findById(id);
    if (category === "specification") {
      const specifications = req.body;
      product.specifications = specifications;
    }
    await product.save();
    return res.json({ status: 200 });
  } catch (err) {
    console.log(err);
    return res.json({ status: 404 });
  }
});

router.delete("/:id", vendorMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await productModel.findByIdAndDelete(id);
    return res.send({ status: 200 });
  } catch (err) {
    console.log(err);
    throw err;
  }
});

export default router;
