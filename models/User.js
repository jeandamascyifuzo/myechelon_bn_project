const mongoose = require("mongoose");
const validator = require('validator')

const TeamSchema = new mongoose.Schema({
    names: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    telephone: {
        type: Number,
        required: true
    },
    image: {
        type: String,
    },
    title: {
        type: String
    },
    password: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        defualt: true
    },
},
    { timestamps: true });

module.exports = mongoose.model("Team", TeamSchema)