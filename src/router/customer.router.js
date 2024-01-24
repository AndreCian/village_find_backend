import { Router } from "express";
import { hash, compare } from "bcrypt";

import customerModel from "../model/customer.model";

const router = Router();

//signup
router.post("/register", async (req, res) => {
  try {
    req.body.password = await hash(req.body.password, 10);
    res.send({
      message: "created",
      data: await customerModel.create({ ...req.body, signup_at: new Date() }),
    });
  } catch (error) {
    res.send({ message: "Error", data: error.message });
  }
});
router.put("/:id", async (req, res) => {
  // let data = await customerModel.findOne({ _id: req.params.id });
  // data = {
  //   ...data,
  //   ...req.body,
  // };
  // console.log("----------------data--------------", data);
  res.send(await customerModel.findByIdAndUpdate(req.params.id, req.body));
});
router.get("/", async (req, res) => {
  try {
    res.send(
      await customerModel.find(
        (() => {
          let obj = {};
          if (req.query.name) obj.name = new RegExp(req.query.name, "g");
          if (req.query.status) obj.status = req.query.status;
          obj.signup_at = {};
          if (req.query.from) obj.signup_at.$gte = req.query.from;
          if (req.query.to) obj.signup_at.$lte = req.query.to;

          if (JSON.stringify(obj.signup_at) == "{}") delete obj.signup_at;

          return obj;
        })()
      )
    );
  } catch (err) {
    res.send(err);
  }
});

router.get("/:id", async (req, res) => {
  res.send(await customerModel.findById(req.params.id));
});
//signin
router.post("/signin", async (req, res) => {
  try {
    const user = await customerModel.findOne({ email: req.body.email });
    if (user && (await compare(req.body.password, user.password))) {
      res.send({ message: "Success" });
    } else res.send({ message: "Failed" });
  } catch (error) {
    res.send({ message: "Error", data: error.message });
  }
});

export default router;
