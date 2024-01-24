import { Router } from "express";
import { hashSync, compare } from "bcrypt";

import { HASH_SALT_ROUND } from "../config";

import vendorModel from "../model/vendor.model";

const router = Router();

//signup
router.post("/register", async (req, res) => {
  try {
    const count = await vendorModel.countDocuments({});
    const {
      shopName,
      firstName,
      lastName,
      email,
      phone,
      password,
      subscription,
      community,
    } = req.body;
    const vendorJson = {
      vendorId: count + 1,
      shopName,
      owner: {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        password: hashSync(password, HASH_SALT_ROUND),
      },
      subscription,
      community,
      status: "Inactive",
      signupAt: new Date(),
    };

    res.json({
      status: 200,
      vendor: await vendorModel.create(vendorJson),
    });
  } catch (error) {
    console.log(error);
    res.json({ status: 500 });
  }
});
router.put("/:id", async (req, res) => {
  let data = await vendorModel.findById(req.params.id);
  data = {
    ...data,
    ...req.body,
  };
  res.send(await vendorModel.findByIdAndUpdate(req.params.id, data));
});
router.get("/", async (req, res) => {
  const { communityId, vendorId } = req.query;
  if (communityId) {
    return res.send(
      await vendorModel.find({ communityId: req.query.communityId })
    );
  } else if (vendorId) {
    const vendor = await vendorModel.findById(vendorId).populate("community");
    if (!vendor) {
      return res.json({ status: 404 });
    }
    return res.json({ status: 200, vendor });
  }
  try {
    res.send(
      await vendorModel.find(
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
//signin
router.post("/signin", async (req, res) => {
  try {
    const user = await vendorModel.findOne({ email: req.body.email });
    if (user && (await compare(req.body.password, user.password))) {
      res.send({ message: "Success" });
    } else res.send({ message: "Failed" });
  } catch (error) {
    res.send({ message: "Error", data: error.message });
  }
});

export default router;
