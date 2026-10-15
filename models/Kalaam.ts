import mongoose, { Schema, models, model } from "mongoose";

const KalaamSchema = new Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["ghazal", "naat", "manqabat", "sher", "bait", "qitaa", "other"],
      default: "other",
    },
    poet: {
      type: Schema.Types.ObjectId,
      ref: "Poet",
      default: undefined,
    },
    poetName: {
      type: String,
      default: "",
      trim: true,
    },
    language: {
      type: String,
      default: "Urdu",
      trim: true,
    },
  },
  { timestamps: true }
);

const Kalaam = models.Kalaam || model("Kalaam", KalaamSchema);

export default Kalaam;