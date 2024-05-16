import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { upload } from "../middlewares/multer.middleware.js";


//ek method for generating access token and refresh token 
const generateAccessAndRefreshTokens = async(userId) => {
    try{
      const user = await User.findById(userId)//is user id ka istaml karke hum user ko find kar lenge
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()
      user.refreshToken = refreshToken
      await user.save({validateBeforeSave:false})//mongo db se banke aata hai iye save method ,, 
      //validateBeforeSave:WE USE THIS SO THAT IT DOES NOT SAVE THE PASSWORD HASH IN THE DB.. EACH TIME
      //REFRESH TOKEN IS SAVE IN THE DB HERE
      return {accessToken,refreshToken}



    }catch{
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens")// humari taraf se mistake hai .. to 500 error
    }
}

const registerUser = asyncHandler( async (req, res) => {

    const {fullName, email, username, password} = req.body

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    console.log("okk8-",req.body)

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log("okk-1",)
    

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

     if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
     }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
} )

const loginUser = asyncHandler(async (req, res) => {
    //req body-> data
    //username or email
    // find the user 
    // compare password
    // generate toke//access and refresh token
    // send cookies
    // send response
    const {email, username, password} = req.body
    if(!email && !username){
        throw new ApiError(400,"email or username is required")
    }
    
    const user = await User.findOne({ // find the user . await used because we want to wait for the user to be found// kyu ki data base to dusre continent me hai 
        $or: [{username},{email}]// theis $or: is mongodb syntax ,,in which if we want to find user with username or email ,, any one of then ,, we can use $or:[{username},{email}]
    })
    // agar user nahi mila to ..
    if(!user)
        {
            throw new ApiError(404,"user not found (please register first)")
        }
    //agar user mil gaya to..
    //uska password check karo fir 
    // capital U wala User mogodb wala hai ,, uspe mongodb ke functions kam kareenge ,, jaise ke findOne ,, humare self defined funcitons , sirf humare declare kie hue user pe hi kaam karenge

    const isPasswordValid = await user.isPasswordCorrect(password)//iye passowd kaha se aya ? iye password hume ne req.body se nikala in line no 84
   
     if(!isPasswordValid){
        throw new ApiError(401,"password is incorrect")
    }
    // abhi password check hone ke baad 
    // access aur refresh tokens bahao
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id) // in the similar way we take the stuff for req.body ,, similarly we desturcure user._id here and take refresh token and access token from it 
    //now we need to send these in form of cookies
    const loggedinUser =  await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true, // by default koi bhi cookies ko modify kar sakta hai server se ,, par jab ap http only karte ho aur secure true karte to ,,, to iye
        //server se modifi ho sakti hai 

    }


    return res.status(200).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedinUser,
                accessToken,
                refreshToken
            },
            "user logged in successfully"
        )
    )


})

const logoutUser = asyncHandler(async (req, res) => {
    // we get this user now ,, by using the middleware of auth middlewares.js .. udhar se hukha
    // udhar se humne req.user ka access liya ,, lookin the middleware to find out ,how
    await User.findByIdAndUpdate
    (
        req.user._id, 
        {
          $set: {
              refreshToken: undefined //this removes the field from document

          }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true, // by default koi bhi cookies ko modify kar sakta hai server se ,, par jab ap http only karte ho aur secure true karte to ,,, to iye
        //server se modifi ho sakti hai 

    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
        200,
        {},
        "user logged out successfully"))
})
const refreshAccessToken = asyncHandler(async(req,res) => 
    {

     const incomingRefreshToken = req.cookies.refreshtoken || req.body.refreshToken

     if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request of incoming refresh token")
     }

     
     try {
        
     } catch (error) {
        throw new ApiError(401,error?.message)
     }

})




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
} 
