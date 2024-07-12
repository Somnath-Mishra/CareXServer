import mongoose from "mongoose";
import conf from "../conf/conf.js";

const DB_NAME="CareXDB";

const connectDB=async()=>{
    try{
        const connectionInstance=await mongoose.connect(`${conf.mongoDBURI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    }
    catch(error){
        console.log("MONGODB connection FAILED ", error);
    }
}



export default connectDB;