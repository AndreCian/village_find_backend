import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";

import customerRouter from "./router/customer.router";
import homepageRouter from "./router/homepage.router";
import footerRouter from "./router/footer.router";
import producttagRouter from "./router/producttag.router";
import metricRouter from "./router/metric.router";
import categoryRouter from "./router/category.router";
import supportRouter from "./router/support.router";
import couponRouter from "./router/coupon.router";
import productRouter from "./router/product.router";
import cartRouter from "./router/cart.router";

import homeRouter from "./router/home.router";
import featuredRouter from "./router/featured.router";
import imagryRouter from "./router/imagry.router";
import communityRouter from "./router/community.router";
import customerEventRouter from "./router/customerevent.router";
import vendorRouter from "./router/vendor.router";
import openaiRouter from "./router/openai";

import { webhookHandler } from "./utils/stripe";

const PORT = 8080;
const app = express();

mongoose.connect(
  "mongodb+srv://root:SfbUVSQ2ROIJ4E44@atlascluster.goevemg.mongodb.net/VillageFinds"
);

app.use(express.json({ limit: "200mb" }));
app.use(cors());

app.use("/api/user/customer", customerRouter);
app.use("/api/user/vendor", vendorRouter);

app.use("/api/homepage", homepageRouter);
app.use("/api/settings/marketplace/home", homeRouter);
app.use("/api/settings/marketplace/featured-products", featuredRouter);
app.use("/api/settings/marketplace/imagry", imagryRouter);
app.use("/api/settings/marketplace/footer", footerRouter);
app.use("/api/settings/general/tag", producttagRouter);
app.use("/api/settings/general/metric", metricRouter);
app.use("/api/settings/general/category", categoryRouter);
app.use("/api/settings/general/support", supportRouter);

app.use("/api/coupons", couponRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/communities/meetup", customerEventRouter);
app.use("/api/communities", communityRouter);

app.use("/api/openai", openaiRouter);
app.post("/api/stripe/webhook/connect", webhookHandler);

app.use("/api/uploads", express.static("uploads"));

app.use((err, req, res, next) => {
  if (err) {
    res.status(500).send(err.message);
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Listened on port ${PORT}`);
});
