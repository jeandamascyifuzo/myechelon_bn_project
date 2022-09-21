const jwt = require("jsonwebtoken");

const { fail } = require('../function/respond')
const User = require("../models/User");

const verifyToken = (req, res, next) => {

    const authHeader = req.headers.token;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SEC, (err, user) => {
            if (err) return fail(res, 403, null, "Wrong Token!");
            req.user = user;
            console.log("done", req.user)
            next();
        })
    } else {
        return fail(res, 401, null, "Not authenticated!");

    }
};
const verifyTokenAndAdmin = (req, res, next) => {
    const authHeader = req.headers.token;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SEC, (err, user) => {
            if (err) return fail(res, 403, null, "Wrong Token!");
            req.user = user;
            if (user.isAdmin) {
                next();
            }
            return fail(res, 403, null, "request admin permission");
        })
    }
};
module.exports = { verifyToken, verifyTokenAndAdmin }