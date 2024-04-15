import { Schema, model } from "mongoose";
import { Types } from "mongoose";

const vendorSchema = new Schema({
  vendorId: Number,
  shopName: String,
  community: {
    type: Types.ObjectId,
    ref: "community",
  },
  stripeAccountID: String,
  commission: Number,
  monthlyFee: Number,
  address: String,
  subscription: Object,
  owner: {
    name: String,
    email: String,
    phone: String,
    password: String,
  },
  business: {
    name: String,
    owner: String,
    email: String,
    phone: String,
    address: String,
    zipcode: String,
  },
  socialUrls: {
    facebook: String,
    twitter: String,
    instagram: String,
    pinterest: String,
    youtube: String,
    linkedin: String,
  },
  store: {
    orderCapacity: String,
    shortDesc: String,
    longDesc: String,
    tags: [String],
    radius: Number,
  },
  images: {
    logoUrl: String,
    finderUrl: String,
    slideUrls: [String],
  },
  fulfillment: {
    pickup: {
      leadTime: Number,
      days: [
        {
          weekday: Number,
          from: String,
          to: String,
        },
      ],
    },
    delivery: {
      leadTime: Number,
      days: [
        {
          weekday: Number,
          from: String,
          to: String,
        },
      ],
    },
    locations: [
      {
        name: String,
        address: String,
        eventDate: Date,
        pickup: {
          weekday: Number,
          from: String,
          to: String,
        },
        instruction: String,
        charge: Number,
        status: String,
      },
    ],
  },
  shipping: {
    services: [String],
    shippoID: String,
    parcels: [
      {
        name: String,
        width: Number,
        height: Number,
        length: Number,
        thickness: Number,
        emptyWeight: Number,
        maxWeight: Number,
        sizeUnit: String,
        massUnit: String,
      },
    ],
  },
  isOpen: Boolean,
  signupAt: Date,
  status: String,
});

export default model("vendor", vendorSchema);
