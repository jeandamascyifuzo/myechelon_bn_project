// const multer = require('multer')
// const uuid = require('uuid').v4

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "uploads");
//     },
//     filename: (req, file, cb) => {
//       const { originalname } = file;
//       cb(null, `${uuid()}-${originalname}`);
//     },
//   });

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.split("/")[0] === "image") {
//       cb(null, true);
//     } else {
//       cb(new Error("incorrect file type"), false);
//     }
//   };
//   const multer = require('multer')
//   const upload = multer({storage,fileFilter});
//   app.post("/api/v1/image",upload.single('file),(req,res)=>{
//     res.status(200).json("file has been uploaded")
// })

