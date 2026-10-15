import { Schema, models, model } from "mongoose";

const AuthorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    penName: { type: String, default: "" },
    biography: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    language: { type: String, default: "Urdu" },
  },
  { timestamps: true }
);

const Author = models.Author || model("Author", AuthorSchema);

export default Author;