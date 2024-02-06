import { Schema, model } from "mongoose";
import { Types } from "mongoose";

const vendorSchema = new Schema({
  vendorId: {
    type: Number,
  },
  shopName: {
    type: String,
  },
  community: {
    type: Types.ObjectId,
    ref: "community",
  },
  commission: {
    type: Number,
  },
  monthlyFee: {
    type: Number,
  },
  address: {
    type: String,
  },
  subscription: {
    type: Object,
  },
  owner: {
    name: String,
    email: String,
    phone: String,
    password: String,
  },
  business: {
    name: String,
    owner: String,
    email: String,
    phone: String,
    address: String,
    zipcode: String,
  },
  socialUrls: {
    facebook: String,
    twitter: String,
    instagram: String,
    pinterest: String,
    youtube: String,
    linkedin: String,
  },
  signupAt: {
    type: Date,
  },
  status: {
    type: String,
  },
});

export default model("vendor", vendorSchema);
