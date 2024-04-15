import { Schema, default as mongoose } from "mongoose";

const ObjectId = mongoose.Types.ObjectId;
export const cartSchema = new Schema({
  orderId: Number,
  orderLogoPath: String,
  customerId: { type: ObjectId, ref: "customer" },
  inventoryId: { type: ObjectId, ref: "inventory" },
  vendorId: { type: ObjectId, ref: "vendor" },
  price: Number,
  quantity: Number,
  deliveryType: String,
  personalization: {
    fee: Number,
    message: String,
  },
  subscription: {
    issubscribed: Boolean,
    iscsa: Boolean,
    frequency: {
      unit: String,
      interval: Number,
    },
    discount: Number,
    duration: Number,
    startDate: Date,
    endDate: Date,
  },
  pickuplocation: {
    name: String,
    address: String,
    charge: Number,
  },
  fulfillday: {
    day: Date,
    from: String,
    to: String,
  },
  gift: {
    receiver: Object,
    isHomeDelivery: Boolean,
    delivery: Object,
  },
  status: String,
  shipping: {
    fullName: String,
    phone: String,
    email: String,
  },
  delivery: {
    street: String,
    city: String,
    state: String,
    country: String,
    extra: String,
    zipcode: Number,
    instruction: String,
  },
  donation: Number,
});

export default mongoose.model("cart", cartSchema);
