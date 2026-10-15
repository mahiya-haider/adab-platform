import mongoose, { Schema, models, model } from "mongoose";

const SuggestionSchema = new Schema(
  {
    bookTitle: { type: String, required: true, trim: true },
    authorName: { type: String, default: "" },
    reason: { type: String, default: "" },
    suggestedBy: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Suggestion =
  models.Suggestion || model("Suggestion", SuggestionSchema);

export default Suggestion;