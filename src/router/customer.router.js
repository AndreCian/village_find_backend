import { Router } from "express";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";

import customerModel from "../model/customer.model";
import { createCustomer } from "../utils/stripe";
import { SECRET_KEY } from "../config";

const router = Router();

router.get("/", async (req, res) => {
  const { name, status, from, to } = req.query;
  try {
    res.send(
      await customerModel.find(
        (() => {
          let obj = {};
          if (name) obj.name = new RegExp(name, "g");
          if (status) obj.status = status;
          obj.signup_at = {};
          if (from) obj.signup_at.$gte = from;
          if (to) obj.signup_at.$lte = to;

          if (JSON.stringify(obj.signup_at) == "{}") delete obj.signup_at;

          return obj;
        })()
      )
    );
  } catch (err) {
    console.log(err);
  }
});

router.get("/:id", async (req, res) => {
  res.send(await customerModel.findById(req.params.id));
});
// signin
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice("Bearer ".length);
    try {
      const tokenUser = await jwt.verify(token, SECRET_KEY);
      if (!tokenUser.id || tokenUser.role !== "customer") {
        return res.json({ status: 401 });
      }
      const currentUser = await customerModel
        .findById(tokenUser.id)
        .select("firstName lastName zipcode");
      if (!currentUser) {
        return res.json({ status: 401 });
      }
      return res.json({ status: 200, profile: currentUser });
    } catch (err) {
      return res.json({ status: 401 });
    }
  }

  try {
    const user = await customerModel
      .findOne({
        $or: [
          { email },
          { phone: email }
        ]
      })
      .select("firstName lastName zipcode password");
    if (!user) {
      return res.json({ status: 404 });
    }
    const isEqual = await compare(password, user.password);
    if (!isEqual) {
      return res.json({ status: 400 });
    }
    const token = await jwt.sign(
      {
        id: user._id,
        role: "customer",
      },
      SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res.json({ status: 200, token, profile: user });
  } catch (error) {
    console.log(error);
    return res.json({ status: 500 });
  }
});

router.post("/register", async (req, res) => {
  const customer = req.body;
  try {
    customer.password = await hash(customer.password, 10);
    customer.signup_at = new Date();
    const profile = await customerModel.create(customer);
    const token = await jwt.sign(
      {
        id: profile._id,
        role: "customer",
      },
      SECRET_KEY,
      { expiresIn: "7d" }
    );
    return res.send({ status: 200, token, profile });
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

export default router;
