import { getUser } from '../service/auth.mjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import conf from '../conf/conf';
import { User } from '../models/user.model';


export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!accessToken) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decodedToken = jwt.verify(accessToken, conf.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
})

/*
async function checkForAuthentication(req,res,next){
    const tokenCookie=req.cookies?.token;
    req.user=null;
    // const authorizationHeaderValue = req.headers["authorization"];
    // if(!authorizationHeaderValue||!authorizationHeaderValue.startsWith('Bearer'))
    //     return next();
    // const token=authorizationHeaderValue.split('Bearer ')[1];

    if(!tokenCookie) return next();

    const token=tokenCookie;
   const user= getUser(token);
    req.user=user;
    return next();
}


function restrictTo(roles){
    return function(req,res,next){
        if(!req.user) 
            return res.redirect("/login");
        if(!roles.includes(req.user.role)) return res.end("Unauthorized from restrictTo()"); 

        return next();
    
    };
}

async function restrictToLoggedinUserOnly(req, res, next) {
    try {
        const tokenCookie = req.cookies?.token;
        // req.user = null;

        // if (!tokenCookie) {
        //     return res.redirect("/login");
        // }

        const token = tokenCookie;
        const user = await getUser(token);

        if (!user) {
            return res.redirect("/login");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in restrictToLoggedinUserOnly:", error);
        return res.status(500).send("Internal Server Error");
    }
}

async function checkAuth(req, res, next) {
    try {
        const tokenCookie = req.cookies?.token;
        // req.user = null;

        // if (!tokenCookie) {
        //     return res.status(401).send("Unauthorized");
        // }

        const token = tokenCookie;
        const user = getUser(token);

        if (!user) {
            return res.redirect("/login");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in checkAuth:", error);
        return res.status(500).send("Internal Server Error");
    }
}


export {checkForAuthentication,restrictTo, restrictToLoggedinUserOnly, checkAuth };
*/
