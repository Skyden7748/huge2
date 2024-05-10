import multer from "multer";
 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
     
      cb(null, file.originalname)
    }
  })
  //this multer function ,, helps us to upload files to our server 
  export const upload = multer({
      storage, })