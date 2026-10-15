import mongoose, { Schema, models, model } from "mongoose";

const PoetSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    penName: { type: String, default: "" },
    biography: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    type: {
      type: String,
      enum: ["poet", "author", "both"],
      default: "poet",
    },
    language: { type: String, default: "Urdu" },
  },
  { timestamps: true }
);

const Poet = models.Poet || model("Poet", PoetSchema);

export default Poet;