import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) =>{
    try{
        
        if(!fs.existsSync(localFilePath)){
            console.log("Local file does not exists 'uploadOnCloudinary' func ");
            return null
        }

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

        // console.log("File uploaded successfully !")
        // console.log("Public Url : ",response.url)
        fs.unlinkSync(localFilePath)
        return response
    }catch(error){
        fs.unlinkSync(localFilePath); // shouldn't we retry uploading : Doubt ??
        return null;
    }
}

export {uploadOnCloudinary}

