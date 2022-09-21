const jwt = require("jsonwebtoken")
const dotenv  = require("dotenv")

dotenv.config()


const sendError = (res , code , data , message) => {
    res.status(code).json({"status": "error" , data , message});
}

const success = (res , code , data , message) => {
    res.status(code).json({"status":"success", data ,message});
}

const fail = (res , code , data , message) => {
    res.status(code).json({"status":"Fail", data , message});
}


const generateToken = (isAdmin)=>{
    return jwt.sign({isAdmin},process.env.JWT_SECRETE,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}
module.exports = { sendError , success , fail, generateToken }
