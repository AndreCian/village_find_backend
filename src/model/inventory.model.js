import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const InventorySchema = new Schema({
  styleId: {
    type: ObjectId,
    ref: "style",
  },
  productId: {
    type: ObjectId,
    ref: "product",
  },
  attrs: [String],
  price: Number,
  quantity: Number,
  image: String,
  status: String,
});

export default mongoose.model("inventory", InventorySchema);
