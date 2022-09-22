const express = require('express')
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generator = require('generate-password')
const { sendEmail, hashPassword, comparePassword } = require("../utils/email");
const { success, fail, sendError, generateToken } = require('../function/respond')

const createUser = async (req, res) => {

  try {
    const { names, email, telephone, title, isAdmin } = req.body

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
    return success(res, 201, { newUser: { names, email, title } }, "Email Sent successfully 👍🏾")
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
    const id = req.params.id
    const names = req.body.names
    const email = req.body.email
    const title = req.body.title
    const telephone = req.body.telephone
    const image = req.body.image
    const password = req.body.password

    const data = await User.findOne({ _d: id })
    console.log("data", data)
    if (data) {
      const updatedUser = await User.findByIdAndUpdate({ _id: id }, {
        $set: {
          names: names,
          email: email,
          title: title,
          telephone: telephone,
          image: image,
          password: hashPassword(password)
        }
      })
      console.log("updatedUser", updatedUser)
      res.status(200).json({ status: 'success', updatedUser, message: 'User updated👍🏾' });

    } else {
      res.status(200).json({ status: 'fail', message: 'something went wrong' });
    }

  } catch (error) {
    res.status(200).json({ status: 'fail', message: error });
  }
}

const userLogin = (req, res, next) => {
  User.find({ email: req.body.email })
    .select("email isAdmin image")
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
          console.log("user:", users)
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
    const oldUser = await User.findOne({ email });
    if (!oldUser) {
      return res.json({ status: "User Not Exists!" + email });
    }
    const secret = process.env.JWT_SECRETE + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "5m",
    });

    const link = `http://localhost:5000/api/v1/team/reset-password/${oldUser._id}/${token}`;
    const message = `
    Dear ${oldUser.names},
    we're sending you this email because you requested a password reset. 
    click on the link below to create a new password
    ${link}
    `;

    await sendEmail({
      email: oldUser.email,
      subject: "Congratulations, welcome to Mychelon.",
      message,
    });
    return success(res, 201, { name: oldUser.names, email: oldUser.email }, "Email Sent successfully 👍🏾")
  } catch (error) { }
};

const resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = process.env.JWT_SECRETE + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
    );
    return success(res, 201, { email: verify.email }, "Password has changed, login now 👍🏾")


  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
};

module.exports = { createUser, getUsers, getUser, deletedUser, updatedUser, userLogin, forgetPassword, resetPassword };
