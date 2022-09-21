const mongoose = require("mongoose");
const validator = require('validator')

const MessageSchema = new mongoose.Schema({
    names: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isEmail(value))
            throw new Error('Invalid Email')
        }
    },
    message: {
        type: String,
        required: true
    }
},
    { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema)