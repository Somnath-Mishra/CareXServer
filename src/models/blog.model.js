import { Schema } from "mongoose";
import * as mongoose from 'mongoose';

const blogSchema=Schema({
    title:{
        type:String,
        trim:true,
        required:true,
    },
    description:{
        type:String,
        trim:true,
        required:true
    },
    content:{
        type:String,
        trim:true,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"Doctor"
    },
    image:{
        type:String//link of cloudinary
    }
},{timestamps:true});

export const Blog=mongoose.model('Blog',blogSchema);