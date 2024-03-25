import mongoose, { Schema } from "mongoose";

const ObjectId = mongoose.Types.ObjectId;

export const cartSchema = new Schema({
  orderId: Number,
  orderLogoPath: String,
  customerId: { type: ObjectId, ref: "customer" },
  inventoryId: { type: ObjectId, ref: "inventory" },
  vendorId: { type: ObjectId, ref: "vendor" },
  price: Number,
  quantity: Number,
  isPersonalized: Boolean,
  personFee: Number,
  personMessage: String,
  status: String,
});

export default mongoose.model("cart", cartSchema);
