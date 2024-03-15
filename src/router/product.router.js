import { Router } from "express";

import productModel from "../model/product.model";
import vendorMiddleware from "../middleware/vendor.middleware";
import upload from "../multer";

const router = Router();

router.get("/", vendorMiddleware, async (req, res) => {
  const { id, community } = req.query;
  if (id) res.send(await productModel.find({ _id: id }).select("name"));
  else if (community) {
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
          "vendor.community": community,
        },
      },
    ]);
    return res.send(products);
  } else {
    res.send(await productModel.find({ vendor: req.vendor._id }));
  }
});

router.post(
  "/",
  vendorMiddleware,
  upload.single("nutrition"),
  async (req, res) => {
    res.send(
      await productModel.create({
        ...req.body,
        vendor: req.params.id,
        //nutrition: req.file.path
      })
    );
  }
);

router.put("/:id", async (req, res) => {
  let data = await productModel.findById(req.params.id);
  data = {
    ...data,
    ...req.body,
  };
  res.send(await productModel.findByIdAndUpdate(req.params.id, data));
});

router.delete("/:id", async (req, res) => {
  res.send(await productModel.findByIdAndDelete(req.params.id));
});

export default router;
