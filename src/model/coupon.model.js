import { Schema, model } from "mongoose";

const schema = new Schema({
  type: {
    type: String,
  },
  date: {
    type: Object,
  },
  usage: {
    type: Object,
  },
  code: String,
  discount: Number,
  conditions: [
    {
      discount: Number,
      maximum: Number,
      minimum: Number,
    },
  ],
  target: {
    type: Object,
  },
});

export default model("coupon", schema);
