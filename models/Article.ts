import mongoose, { Schema, models, model } from "mongoose";

const ArticleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    summary: { type: String, default: "" },
    author: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    language: { type: String, default: "Urdu" },
  },
  { timestamps: true }
);

const Article =
  models.Article || model("Article", ArticleSchema);

export default Article;