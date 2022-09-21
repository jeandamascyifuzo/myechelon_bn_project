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
    you have selected to be a member of Mychelon, please login to our site:${URL}, 
    your username and password are as follow: 
    username:${newUser.email}, 
    Password:${password}.
    `;
    await sendEmail({
      email: newUser.email,
      subject: "Congratulations, welcome Mychelon.",
      message,
    });
    const userSaved = await newUser.save();
    return success(res, 201, {newUser:{names,email,title}}, "Email Sent successfully 👍🏾")
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
  // try {
  //   var id = req.params.id;
  //   let bodyData = req.body;

  //   // req.body.password = hashPassword(req.body.password)

  //   let data = await User.findOneAndUpdate(
  //     { _id: id },
  //     { $set: bodyData });
  //   const findeUpdateUser = await User.findOne({ _id: id });
  //   if (findeUpdateUser) {
  //     message = `User updated successful`;
  //     success(res, 200, findeUpdateUser, message);
  //     return;
  //   }
  //   else {
  //     message = `We don't have User with this id ${id}`;
  //     fail(res, 404, null, message);
  //     return;
  //   }
  // }
  // catch (error) {
  //   return sendError(res, 500, null, error.message)
  // }
  try {
    const id = req.params.id
    const names = req.body.names
    const email = req.body.email
    const title = req.body.title
    const telephone = req.body.telephone
    const image = req.body.image
    const password = req.body.password

    const data = await User.findOne({_d: id})
    console.log("data",data)
    if(data){
      const updatedUser = await User.findByIdAndUpdate({_id: id},{$set:{
        names:names,
        email:email,
        title:title,
        telephone:telephone,
        image:image,
        password: hashPassword(password)
      }})
      console.log("updatedUser",updatedUser)
      res.status(200).json({ status: 'success', updatedUser, message: 'User updated👍🏾' });
      
    }else{
      res.status(200).json({ status: 'fail', message: 'something went wrong' });
    }
    
  } catch (error) {
    res.status(200).json({ status: 'fail', message: error});
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
            
           const users=  [user[0].names, user[0].email, user[0].telephone]
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

// const userLogin = async (req, res) => {
//     try {

//         const user = await User.findOne({ email: req.body.email });
//         !user && res.status(401).json("wrong credentials!")

//         const hashedPassword = CryptoJS.AES.decrypt(
//             user.password,
//             process.env.PASS_SEC
//         );
//         const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
//         originalPassword !== req.body.password && res.status(401).json({
//             status: 'fail',
//             message: 'wrong credentials!'
//         });

//         const accessToken = generateToken(user._id)

//         const data = {
//             names: user.names,
//             email: user.email,
//             telephone: user.telephone,
//             title: user.title
//         }
//         res.status(200).json({ status: 'success', data, accessToken, message: 'Wellcome 👍🏾' });

//     } catch (error) {
//         // console.error(error)
//         return sendError(res, 500, null, error.message)
//     }

// }

module.exports = { createUser, getUsers, getUser, deletedUser, updatedUser, userLogin };
