import mongoose, { Schema, model } from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const productSchema = new Schema({
  vendor: {
    type: ObjectId,
    ref: "vendor",
  },
  name: {
    type: String,
  },
  category: {
    type: String,
  },
  deliveryTypes: [String],
  shortDesc: {
    type: String,
  },
  longDesc: {
    type: String,
  },
  disclaimer: {
    type: String,
  },
  nutrition: {
    type: String,
  },
  soldByUnit: {
    type: String,
  },
  tax: {
    type: String,
  },
  status: {
    type: String,
  },
  specifications: [
    {
      name: String,
      value: String,
    },
  ],
  customization: {
    customText: String,
    fee: Number,
  },
  subscription: {
    frequency: String,
    discount: Number,
    duration: Number,
    startDate: String,
    endDate: String,
  },
});
export default model("product", productSchema);
