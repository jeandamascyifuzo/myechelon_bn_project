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
        default: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909__480.png"
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