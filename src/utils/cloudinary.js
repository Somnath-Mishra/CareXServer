import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
import conf from '../conf/conf.js'

//Configure cloudinary
cloudinary.config({
    cloud_name:conf.CLOUDINARY_CLOUD_NAME,
    api_key:conf.CLOUDINARY_CLOUD_API_KEY,
    api_secret:conf.CLOUDINARY_CLOUD_SECRET_KEY
})

export const uploadOnCloudinary=async (localFilePath)=>{
    try{
        if(!localFilePath) return null;
        //upload file on cloudinary;
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        //file has been uploaded successfully
        fs.unlinkSync(localFilePath);
        return response;
    }catch(error){
        fs.unlinkSync(localFilePath);//remove the locally saved temporary file
        //as the upload operation faliled
        return null;
    }
}

export const uploadPDFOnCloudinary=async(localFilePath)=>{
    try{
        if(!localFilePath) return null;
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        fs.unlinkSync(localFilePath);
        return response;
    }catch(error){
        fs.unlinkSync(localFilePath);
        return null;
    }
}