const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    desc: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    }
},
    { timestamps: true });

module.exports = mongoose.model("Services", ServiceSchema)