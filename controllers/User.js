const express = require('express')
const User = require("../models/User");
const Token = require("../models/Token");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generator = require('generate-password')
const { sendEmail, hashPassword, comparePassword } = require("../utils/email");
const { success, fail, sendError, generateToken } = require('../function/respond')

const createUser = async (req, res) => {

  try {
    const { names, email, telephone, title, isAdmin, image } = req.body

    const passwordNew = generator.generate({
      length: 11,
      numbers: true
    });

    const hashedPassword = passwordNew

    const password = hashedPassword
    const newUser = new User({
      names: names,
      email: email,
      telephone: telephone,
      password: hashPassword(password),
      title: title,
      image: image,
      isAdmin: isAdmin,
    });
    const findUser = await User.findOne({ email: email });
    if (findUser) return sendError(res, 409, null, "This email address exist ");
    const emailExpression =
      /^(([^<>()\[\]\\.,;:\s@“]+(\.[^<>()\[\]\\.,;:\s@“]+)*)|(“.+“))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const isValidEmail = emailExpression.test((email).toLowerCase())
    if (!isValidEmail)
      return sendError(res, 409, null, "invalid email format");

    const URL = `https://www.mychelon.rw/`;
    const message = `
    Dear ${newUser.names},
    Congratulations, you are most welcome to Mychelon company ltd. 
    you have selected to be a member of Mychelon.
    please login to our site:${URL}, 
    your username and password are as follow: 
    username:${newUser.email}, 
    Password:${password}
    `;
    await sendEmail({
      email: newUser.email,
      subject: "Congratulations, welcome Mychelon.",
      message,
    });
    const userSaved = await newUser.save();
    return success(res, 201, null, "Email Sent successfully 👍🏾")
  } catch (error) {
    return sendError(res, 500, null, error.message)
  }
}

const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort("-createdAt");
    return success(res, 200, users, "retrieved all users")
  } catch (error) {
    return sendError(res, 500, null, error.message)
  }
}

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return fail(res, 400, null, "user doesn't exist")
    return success(res, 200, user, "retrieved Team member")

  } catch (error) {
    return sendError(res, 500, null, error.message)
  }
}

const deletedUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return fail(res, 400, null, "user doesn't exist")
    return success(res, 200, null, "user deleted successful")
  } catch (error) {
    return sendError(res, 500, null, error.message)
  }
}

const updatedUser = async (req, res) => {
  try {
    var id = req.params.id;
    const updatedUser = await User.findByIdAndUpdate({ _id: id }, req.body, {
        new: true,
    })
    if (updatedUser) {
        message = `User updated successful`;
        success(res, 200, updatedUser, message);
        return;
    }
    else {
      message = `We don't have User with this id ${id}`;
      fail(res, 404, null, message);
      return;
    }
  } catch (error) {
    res.status(200).json({ status: 'fail', message: error });
  }
}

const userLogin = (req, res, next) => {
  User.find({ email: req.body.email })
    .select("password email isAdmin image")
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "invalid credential"
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "invalid credential"
          });
        }

        if (result) {
          const token = jwt.sign(
            {
              isAdmin: user[0].isAdmin,
              email: user[0].email,
              userId: user[0]._id
            },
            process.env.JWT_SEC,
            {
              expiresIn: "1h"
            }
          );

          const users = [user[0].names, user[0].email, user[0].telephone]
          return res.status(200).json({ status: 'success', user, token, message: 'Welcome 👍🏾' });
        }
        res.status(401).json({
          message: "Auth failed"
        });
      });
    })
    .catch(err => {
      console.log(err);
      return sendError(res, 500, null, err.message)
    });
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ status: "User Not Exists!" + email });
    }

    let token = await Token.findOne({ id: user._id });
    if (!token) {
      token = await new Token({
        id: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const link = `${process.env.BASE_URL || 'http://localhost:5000/api/v1/team/reset/password/'}${user._id}/${token.token}`;
    const message = `
    Dear ${user.names},
    we're sending you this email because you requested a password reset. 
    click on the link below to create a new password
    ${link}
    `;

    await sendEmail({
      email: user.email,
      subject: "Reset Password, welcome to Mychelon.",
      message,
    });
    return success(res, 201, { name: user.names, email: user.email }, "Email Sent successfully 👍🏾")
  } catch (error) { }
};

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).send("invalid link or expired");

    const token = await Token.findOne({
      id: user._id,
      token: req.params.token,
    });

    if (!token) return res.status(400).send("Invalid link or expired");

    const encryptedPassword = await bcrypt.hash(password, 10);
    user.password = encryptedPassword
    await user.save();
    await token.delete();
    return success(res, 201, user, "Password has changed, login now 👍🏾")

  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
};

module.exports = { createUser, getUsers, getUser, deletedUser, updatedUser, userLogin, forgetPassword, resetPassword };
