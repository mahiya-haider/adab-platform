
import mongoose, { Schema, models, model } from "mongoose";

const ChapterSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  { _id: true }
);

const BookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      enum: ["English", "Hindi", "Urdu", "Roman Urdu"],
      default: "Urdu",
    },

    // Actual text for short books or single-part works
    content: {
      type: String,
      default: "",
    },

    // For books divided into chapters
    chapters: {
      type: [ChapterSchema],
      default: [],
    },

    readingDirection: {
      type: String,
      enum: ["ltr", "rtl"],
      default: "rtl",
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    accessType: {
      type: String,
      enum: ["free", "membership"],
      default: "free",
    },

    suggestionId: {
      type: Schema.Types.ObjectId,
      ref: "Suggestion",
      default: null,
    },
  },
  { timestamps: true }
);

BookSchema.index(
  { suggestionId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      suggestionId: { $type: "objectId" },
    },
  }
);

const Book = models.Book || model("Book", BookSchema);

export default Book;
