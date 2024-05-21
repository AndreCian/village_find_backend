import { Schema, default as mongoose } from "mongoose";

const ObjectId = mongoose.Types.ObjectId;
export const cartSchema = new Schema({
  orderId: Number,
  stripeCustomerID: String,
  guestId: String,
  customerId: { type: ObjectId, ref: "customer" },
  productId: { type: ObjectId, ref: 'product' },
  vendorId: { type: ObjectId, ref: "vendor" },
  name: String,
  price: Number,
  quantity: Number,
  discount: Number,
  image: String,
  attributes: [
    {
      name: String,
      value: String
    }
  ],
  deliveryType: String,
  personalization: {
    fee: Number,
    message: String,
  },
  buymode: String,
  subscription: {
    iscsa: Boolean,
    subscribe: String,
    frequencies: [String],
    discount: Number,
    csa: {
      duration: Number,
      frequency: String,
      startDate: Date,
      endDate: Date,
    }
  },
  pickuplocation: {
    name: String,
    address: String,
    charge: Number,
    instruction: String,
    pickupDate: Date,
    pickupTime: {
      from: String,
      to: String
    }
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
});

export default mongoose.model("cart", cartSchema);
