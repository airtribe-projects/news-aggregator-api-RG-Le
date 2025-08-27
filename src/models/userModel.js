const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    preferences: {
        type: [String],
        default: []
    },
    read: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article", // reference to Article model
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article", // reference to Article model
      },
    ],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema, "users");