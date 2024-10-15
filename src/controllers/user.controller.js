import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js" 
import {ApiResponse} from "../utils/ApiResponse.js"

const userRegister = asyncHandler(async (req,res,next) => {

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

export {userRegister}

