import mongoose, { Schema } from "mongoose";

export const cartSchema = new Schema({
  productId: Schema.ObjectId,
  styleId: Schema.ObjectId,
  inventoryId: Schema.ObjectId,
  customerId: Schema.ObjectId,
  quantity: Number,
});

export default mongoose.model("cart", cartSchema);
