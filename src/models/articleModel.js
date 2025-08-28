const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    url: {
        type: String,
        required: true,
        unique: true
    },
    lang: {
        type: String,
        required: true
    },
    source: {
        name: { type: String },
        country: { type: String },
        url: { type: String }
    }
});

module.exports = mongoose.model("Article", articleSchema, "articles");