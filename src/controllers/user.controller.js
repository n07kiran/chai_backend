import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js" 
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save( { validateBeforeSave : false })

        return {accessToken,refreshToken}
    }catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req,res,next) => {

    // console.log("req : \n",req)
    // get the data from the frontend
    const {username,email,fullName,password} = req.body;
    // console.log(username,email,fullName,password)

    // perform validation -> can use Zod
    if( [username,email,fullName,password].some((field) => field?.trim() === "" )) // empty fields
    {
        throw new ApiError(400,"Fields are empty!")
    }

    // existing user from db
    const existingUser = await User.findOne({
        $or:[{username : username},{email : email}]
    })

    if(existingUser){
        throw new ApiError(409,"User already Exists!");
    }

    // console.log("req.files : ", req.files)

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required!")
    }

    const avatarStatus = await uploadOnCloudinary(avatarLocalPath)
    const coverImageStatus = await uploadOnCloudinary(coverImageLocalPath)

    // console.log("Avatar Status : ",avatarStatus)
    // console.log("Cover Status : ",coverImageStatus)

    const user = await User.create({
        username,
        fullName,
        email,
        password,
        avatar : avatarStatus.url,
        coverImage : coverImageStatus?.url || "",

    })

    const createdUser = await User.findById(user._id).select({password: 0 , refreshToken:0})

    if(!createdUser){
        throw new ApiError(500,"Error in uploading to DB!")
    }

    // console.log("User : ",createdUser)

    // console.log("res : \n",res)
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully!")
    )
})

const loginUser = asyncHandler(async (req,res,next)=>{
    // 1. get the username and password from the frontend : req.body -> data
    // 2. search for existing user and compare the password : username or email , 
    // 3. if true : generate access and refresh token and send it in secure cookies
    // 4. if false : inValid
    // 5. send response

    const {username,email,password} = req.body

    if(!username && !email){
        throw new ApiError(400,"Username or email is required!")
    }

    const user = await User.findOne({
        $or : [{email : email},{username: username}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials!")
    }
    // console.log("Valid Password!")

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    // console.log({accessToken : accessToken , refreshToken : refreshToken})
    
    const loggedInUser = await User.findById(user._id).select({password:0,refreshToken:0})

    const cookieOptions = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser,accessToken,refreshToken
            },
            "User logged In Successfully"

        )
    )


})

const logoutUser = asyncHandler(async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $set : {
                refreshToken : ""
            }
        },
        {
            new : true
        })


    const cookieOptions = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(
        new ApiResponse(200,{},"User logged out!")
    )

})

const refreshAccessToken = asyncHandler( async (req,res,next) => {
    const incomingRefreshToken = req.cookie || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Refresh Token is empty! : unauthorized request")
    }

    const decodedUser = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET_KEY)

    if(!decodedUser){
        throw new ApiError(401,"Unauthorized access ! InValid Refresh token")
    }

    const user = await User.findById(decodedUser._id)

    if(!user || incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"Unauthorized access ! InValid Refresh token")    
    }

    const newAccessToken = await user.generateAccessToken()

    const cookieOptions = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",newAccessToken)
    .json(
        new ApiResponse(
            200,
            {
                accessToken : newAccessToken
            },
            "Access token Refreshed"
        )
    )
})

export {registerUser , loginUser , logoutUser, refreshAccessToken}

