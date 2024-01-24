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
  signupAt: {
    type: Date,
  },
  status: {
    type: String,
  },
});

export default model("Vendor", vendorSchema);
