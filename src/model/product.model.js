import { Schema, model } from "mongoose";

const productSchema = new Schema({
  vendor: {
    type: Schema.Types.ObjectId,
    ref: "Vendor",
  },
  name: {
    type: String,
  },
  category: {
    type: String,
  },
  marketType: {
    type: String,
  },
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
  styles: [
    {
      name: String,
      discount: Number,
      status: String,
      attributes: [
        {
          name: String,
          values: [String],
        },
      ],
      inventories: [
        {
          inventory: Number,
          price: Number,
          status: String,
        },
      ],
    },
  ],
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
});
export default model("product", productSchema);
