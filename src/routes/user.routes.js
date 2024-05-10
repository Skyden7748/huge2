import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from"../middlewares/multer.middleware.js"

const router = Router();
//now when ever someone requests on register , then the registerUser function will be called
//but we need to inject some middle wares such that we can upload the files

router.route("/register").post(//now instead of directly calling the registerUser function , we need to call the upload function , which we had exported from multer 
//the the upload fucntion gives us lot of functions ,, upload.fields is one of the ,, in which we take an array of objects 
//so here we have taken an array of two objects , which is of avatar image and cover image
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"cover",
            maxCount:1
        }
    ]),registerUser);





export default router;