import { Router } from "express";
import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";

import { SECRET_KEY, HASH_SALT_ROUND } from "../config";

import vendorModel from "../model/vendor.model";
import vendorMiddleware from "../middleware/vendor.middleware";

const router = Router();

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

router.get("/profile/:category", vendorMiddleware, async (req, res) => {
  const vendor = req.vendor;
  const { category } = req.params;
  if (category === "business") {
    return res.send(vendor.business);
  } else if (category === "social-urls") {
    return res.send(vendor.socialUrls);
  }
});

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

router.post("/login", async (req, res) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice("Bearer ".length);

    try {
      const tokenUser = await jwt.verify(token, SECRET_KEY);
      if (!tokenUser.id || tokenUser.role !== "vendor") {
        return res.json({ status: 401 });
      }
      const currentUser = await vendorModel.findById(tokenUser.id);
      if (!currentUser) {
        return res.json({ status: 401 });
      }
      return res.json({ status: 200 });
    } catch (err) {
      return res.json({ status: 401 });
    }
  }

  const { email, password } = req.body;
  try {
    const vendor = await vendorModel.findOne({ "owner.email": email });
    if (!vendor) {
      return res.json({ status: 404 });
    }
    if (!compareSync(password, vendor?.owner.password)) {
      return res.json({ status: 400 });
    }

    const token = jwt.sign({ id: vendor._id, role: "vendor" }, SECRET_KEY, {
      expiresIn: "7d",
    });
    return res.json({ status: 200, token });
  } catch (error) {
    console.log(error);
    return res.json({ status: 500 });
  }
});

router.put("/profile/:id", vendorMiddleware, async (req, res) => {
  const id = req.params.id;
  const vendor = req.vendor;
  console.log(vendor);
  if (id === "business") {
    vendor.business = req.body;
    vendor
      .save()
      .then((response) => {
        return res.json({ status: 200, business: response.business });
      })
      .catch((err) => {
        return res.json({ status: 500 });
      });
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

export default router;
