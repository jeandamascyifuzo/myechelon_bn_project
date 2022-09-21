const mongoose = require("mongoose");
const validator = require('validator')

const PortifolioSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    desc: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    cloudinary_id: {
        type: String,
      },
},
    { timestamps: true });

module.exports = mongoose.model("Portifolio", PortifolioSchema)