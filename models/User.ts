
import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    penName: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    books: [{ type: Schema.Types.ObjectId, ref: "Book" }],
    relatedPoetsAuthors: [{ type: String }],
    membershipStatus: {
      type: String,
      enum: ["inactive", "active"],
      default: "inactive",
    },
    membershipExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

export default User;
