//require('dotenv').config({path: "./.env"});
import mongoose from "mongoose";
import {DB_NAME} from "./constants.js"
import dotenv from "dotenv"
import express from "express"
import connectDB from "./db/index.js";
//import userRouter from "./routes/user.routes.js"
import { app } from "./app.js";






//const app = express()
dotenv.config({
   path: "./.env"
})

//app.use("/api/v1/users", userRouter)
connectDB()
.then(()=>{
   app.listen(process.env.PORT || 8000,()=>{
      console.log(`server is running at port :${process.env.PORT }`)
   })
})
.catch((err) => {
   console.log("MONGO DB CONNECT FAILED",err)
})




/*
( async () => {
    try{
      await mongoose.connect(`${process.env.MONGODB_URI}/$
       {DB_NAME}`)
       app.on("error", (error) =>
      {
        console.error("ERROR: ",error);
        throw error
      })

      app.listen(process.env.PORT,()=>
      {
        console.log(`listening on port ${process.env.PORT}`)
      })
    }
    catch(error)
    {
       console.error("ERROR: ",error) 
       throw err
    }
})()
*/