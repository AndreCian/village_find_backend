import mongoose, { Schema, model } from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const productSchema = new Schema({
  id: String,
  vendor: {
    type: ObjectId,
    ref: "vendor",
  },
  name: String,
  category: String,
  tags: [String],
  deliveryTypes: [String],
  shortDesc: String,
  longDesc: String,
  disclaimer: String,
  nutrition: String,
  soldByUnit: String,
  price: Number,
  quantity: Number,
  image: String,
  tax: String,
  status: String,
  specifications: [
    {
      name: String,
      value: String,
    },
  ],
  iscustomizable: Boolean,
  customization: {
    customText: String,
    fee: Number,
  },
  subscription: {
    iscsa: Boolean,
    frequencies: [String],
    discount: Number,
    csa: {
      frequency: String,
      duration: Number,
      startDate: Date,
      endDate: Date
    }
  },
  stylesOrder: [{ type: ObjectId, ref: 'style' }],
  createdAt: Date,
});
export default model("product", productSchema);
