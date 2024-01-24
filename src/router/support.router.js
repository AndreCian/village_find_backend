import { Router } from "express"
import supportModel from "../model/support.model"
import upload from "../multer"

const router = Router();

router.get("/", async (req, res) => {
    res.send(await supportModel.find({}));
});
router.get("/:id", async (req, res) => {
    res.send(await supportModel.findById(req.params.id));
});

router.post("/", async (req, res) => {
    res.send({ message: "created", data: await supportModel.create(req.body) });
});

router.put("/image", upload.single("img"), async (req, res) => {
    let body = {}
    body[req.query.field] = req.file.path;
    res.send({ mesage: "updated", data: await supportModel.findByIdAndUpdate(req.query.id, body, { new: true }) });
});


router.put("/", async (req, res) => {
    res.send({ message: "updated", data: await supportModel.findByIdAndUpdate(req.query.id, req.body) });
});

router.delete("/", async (req, res) => {
    res.send({ message: "deleted", data: await supportModel.findByIdAndDelete(req.query.id) });
})


export default router;