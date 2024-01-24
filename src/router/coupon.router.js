import { Router } from "express";
import couponModel from "../model/coupon.model";

const router = Router();

router.get("/", async (req, res) => {
  res.send(await couponModel.find({}));
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const coupon = await couponModel.findOne({ _id: id });
  res.json({ status: 200, coupon });
});

router.post("/", async (req, res) => {
  const coupon = { ...req.body, status: "Inactive" };
  await couponModel.create(coupon);
  res.json({ status: 200 });
});

router.put("/", async (req, res) => {
  res.send({
    message: "updated",
    data: await couponModel.findByIdAndUpdate(req.query.id, req.body),
  });
});

router.delete("/", async (req, res) => {
  res.send({
    message: "deleted",
    data: await couponModel.findByIdAndDelete(req.query.id),
  });
});

export default router;
