import { Schema, model } from "mongoose";

const customerSchema = new Schema({
  stripeCustomerID: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  address: {
    type: String,
  },
  zipcode: {
    type: String,
  },
  password: {
    type: String,
  },
  status: {
    type: String,
  },
  signup_at: {
    type: Date,
  },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

customerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
})

export default model("customer", customerSchema);
