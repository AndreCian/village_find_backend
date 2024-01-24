import { Schema, model } from "mongoose";

const customerSchema = new Schema({
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
});

export default model("customer", customerSchema);
