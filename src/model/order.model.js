import { Schema, default as mongoose } from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const OrderSchema = new Schema({
  orderId: Number,
  customerID: {
    type: ObjectId,
    ref: "customer",
  },
  vendorID: {
    type: ObjectId,
    ref: "vendor",
  },
  orderInfo: {
    createdAt: Date,
    isshipping: Boolean,
    issubscription: Boolean,
    iscsa: Boolean,
    issubstitute: Boolean,
    deliveryType: String,
    address: String,
    instruction: String,
    personalization: String,
    csa: {
      cycle: Number,
      duration: Number,
      payment: String,
      status: String,
    },
  },
  giftInfo: {
    recipient: String,
    email: String,
    phone: String,
    message: String,
  },
  product: {
    imageUrl: String,
    name: String,
    price: Number,
    quantity: Number,
    discount: Number,
    gift: {
      recipient: String,
      email: String,
      phone: String,
      message: String,
    },
    personalization: String,
  },
  createdAt: Date,
  status: String,
});

export default mongoose.model("order", OrderSchema);
