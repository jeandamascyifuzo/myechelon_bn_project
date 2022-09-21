// @ts-nocheck
const nodemailer = require("nodemailer")
const bcrypt =require('bcryptjs');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service:process.env.EMAIL_SERVICE,
    auth: {
      user:process.env.EMAIL_USERNAME,
      pass:process.env.EMAIL_PASSWORD
    },
  })

  const emailOptions = {
    from: "Mychelon Rwanda <jeancyifuzodamas@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  }
  await transporter.sendMail(emailOptions)
}

const hashPassword = (password) => bcrypt.hashSync(password, 10);
const comparePassword = (password, hash) => bcrypt.compareSync(password, hash);

module.exports = { sendEmail, hashPassword, comparePassword }

