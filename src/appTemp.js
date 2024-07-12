
import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import conf from './conf/conf.js';
import connectDB from './db/index.js';


const app=express();
app.use(cors({
    origin:conf.CORS_ORIGIN,
    Credential:true
}))

app.use(express.json({
    limit:'64kb'
}));
app.use(express.urlencoded({
    extended:true,
    limit:'64kb'
}));
app.use(cookieParser());
app.use(express.static('public'));

//Routes import
import userRoute from './routes/user.routes.js';


//routes declaration
app.use("/api/v1/user",userRoute);

export {app};