import { Router } from "express";
import productModel from "../model/product.model";
import upload from "../multer"
const router = Router();

router.get("/", async (req, res) => {
    if (req.query.id)
        res.send(await productModel.find({ _id: req.query.id }));
    else
        res.send(await productModel.find({}));
});
router.post("/:id", upload.single("nutrition"), async (req, res) => {
    res.send(await productModel.create({
        ...req.body,
        vendorId: req.params.id
        //nutrition: req.file.path
    }));
});

router.put("/:id", async (req, res) => {
    let data = await productModel.findById(req.params.id);
    data = {
        ...data,
        ...req.body
    }
    res.send(await productModel.findByIdAndUpdate(req.params.id, data));
});

router.delete("/:id", async (req, res) => {
    res.send(await productModel.findByIdAndDelete(req.params.id));
})


export default router;
