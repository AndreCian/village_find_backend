import { Router } from "express";
import producttagModel from "../model/producttag.model";

const router = Router();

router.post("/", async (req, res) => {
  res.send({
    message: "created",
    data: await producttagModel.create(req.body),
  });
});

router.get("/", async (req, res) => {
  res.send(await producttagModel.find({ name: new RegExp(req.query.name, "g"), status: new RegExp(req.query.status, "g") }));
});
router.get("/:id", async (req, res) => {
  res.send(await producttagModel.findById(req.params.id));
});

router.put("/", async (req, res) => {
  res.send({
    message: "updated",
    data: await producttagModel.findByIdAndUpdate(req.query.id, req.body, {
      new: true,
    }),
  });
});

router.delete("/", async (req, res) => {
  res.send({
    message: "deleted",
    data: await producttagModel.findByIdAndDelete(req.query.id),
  });
});

export default router;
