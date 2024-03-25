import mongoose from "mongoose";

const Schma = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const OrderSchema = new Schema({
  orderId: Number,
  customer: {
    type: ObjectId,
    ref: "customer",
  },
  vendor: {
    type: ObjectId,
    ref: "vendor",
  },
  shipMethod: [String],
  shipOrder: {
    createdAt: Date,
    orderClass: String,
    address: String,
    deliveryIns: String,
    isSubstitute: Boolean,
  },
  giftInfo: {
    recipient: String,
    email: String,
    phone: String,
    message: String,
  },
  personalization: String,
  products: [
    {
      image: String,
    },
  ],
});

export default mongoose.model("order", OrderSchema);
