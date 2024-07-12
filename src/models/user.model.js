import mongoose, { Schema, Types } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import conf from "../conf/conf.js";

const options={discriminatorKey:"user"};

export const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
        trim: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String
    },
    role: {
        type: String,
        enum: ["user", "admin", "doctor"],
        default: "user",
    },
    appointmentHistory:{
        type:Schema.Types.ObjectId,
        ref:"Appointment"
    }
},
    {
        timestamps: true,
    },
    options
)

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}
userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            role: this.role,
            email: this.email,
            userName: this.userName,
            firstName: this.firstName,
            lastName: this.lastName,
        },
        conf.ACCESS_TOKEN_SECRET
        ,
        {
            expiresIn: conf.ACCESS_TOKEN_EXPIRY
        });
}

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        conf.REFRESH_TOKEN_SECRET
        ,
        {
            expiresIn: conf.REFRESH_TOKEN_EXPIRY
        });
}

export const User = mongoose.model('User', userSchema);
