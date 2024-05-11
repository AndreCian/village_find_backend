import { Schema, default as mongoose } from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const OrderSchema = new Schema({
  orderID: Number,
  vendorID: {
    type: ObjectId,
    ref: "vendor",
  },
  customerName: String,
  deliveryType: String,
  deliveryInfo: {
    orderDate: Date,
    classification: String,
    address: String,
    instruction: String,
    isSubstitute: Boolean,
  },
  gift: {
    recipient: String,
    email: String,
    phone: String,
    message: String,
  },
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String,
  },
  personalization: String,
  product: {
    image: String,
    name: String,
    shipping: {
      service: String,
      rate: Number,
    },
    delivery: {
      fee: Number,
    },
    subscription: {
      cycle: {
        total: Number,
        current: Number,
      },
      status: String,
      payment: String,
    },
    price: Number,
    quantity: Number,
    discount: Number,
  },
  status: String,
});

export default mongoose.model("order", OrderSchema);
