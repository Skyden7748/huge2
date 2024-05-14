
import fs from "fs"
import {v2 as cloudinary} from 'cloudinary';



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key:  process.env.CLOUDINARY_API_KEY, 
        api_secret:  process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
    });

    const uploadOnCloudinary = async (localFilePath) => {
        console.log("local file path",localFilePath)
        try{
           if(!localFilePath){
            
            return null
           }
           //upload the file on cloudinary
           const response = await cloudinary.uploader.upload(localFilePath, function (error, result) {
            if(error) {
                console.log("error while uploading file", error)
            }
            else {
                console.log("file uploaded successfully")
            }
           })
           // file has been uploaded successfully 
           fs.unlinkSync(localFilePath, (err) => {
            if(err) {
                console.log("error while deleting file",err)
            }
            console.log("file deleted")

           })
           
           return response;
        }
        catch(error){
           fs.unlinkSync(localFilePath);
          
           //remove the locally saved temp file
           // as the uploead operation got failed 
           return null;
        }
    }



    
    // Upload an image
  
    
export {uploadOnCloudinary}
