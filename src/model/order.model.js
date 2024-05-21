import { Schema, default as mongoose } from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const OrderSchema = new Schema({
  orderID: Number,
  vendorID: {
    type: ObjectId,
    ref: "vendor",
  },
  customerID: {
    type: ObjectId,
    ref: 'customer'
  },
  deliveryType: String,
  deliveryInfo: {
    classification: String,
    address: String,
    instruction: String,
    isSubstitute: Boolean,
  },
  locationInfo: {
    instruction: String,
    name: String,
    address: String,
    pickDate: Date,
    pickTime: String,
  },
  pickupInfo: {
    address: String,
  },
  gift: {
    name: String,
    email: String,
    phone: String,
    message: String,
  },
  customer: {
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
      iscsa: Boolean,
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
    subtotal: Number,
    soldByUnit: String
  },
  status: String,
  orderDate: Date,
});

export default mongoose.model("order", OrderSchema);
