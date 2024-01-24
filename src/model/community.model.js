import { Schema, model } from "mongoose";

const schema = new Schema({
  name: {
    type: String,
  },
  organizer: {
    firstName: String,
    lastName: String,
  },
  status: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  code: {
    type: String,
  },
  phone: {
    type: String,
  },
  announcement: {
    text: String,
    updated_at: Date,
  },
  shortDesc: {
    type: String,
  },
  longDesc: {
    type: String,
  },
  slug: {
    type: String,
  },
  events: [
    {
      name: String,
      address: String,
      fulfillment: {
        date: Date,
        startTime: String,
        endTime: String,
      },
      detail: String,
      isActive: Boolean,
      link: String,
      questions: [String],
      status: String,
      attendees: [
        {
          name: String,
          date: Date,
          height: {
            min: Number,
            max: Number,
          },
          weight: Number,
          isAttend: Boolean,
        },
      ],
    },
  ],
  images: {
    logoUrl: String,
    backgroundUrl: String,
  },
  signup_at: {
    type: Date,
  },
});

export default model("community", schema);
