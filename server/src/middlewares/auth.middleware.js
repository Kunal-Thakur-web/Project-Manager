import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import {ProjectMember} from "../models/projectMember.models.js";


export const verifyJWT = asyncHandler(async (req,res,next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");

    if(!token) {
        throw new ApiError(401, "Unauthorized acesss!");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerification -emailVerificationExpiry");

        if(!user) {
            throw new ApiError(401,"Invalid access token");
        }

        req.user = user;
        next();
    } catch(err) {
        throw new ApiError(401,"Invalid access token!");
    }
});


export const validateProjectPermissions = (roles =[]) => {
    return asyncHandler(async (req,res,next) => {
        const {projectId} = req.params;

        if(!projectId) {
            throw new ApiError(400,"Project id is required");
        }

        const projectMember = await ProjectMember.findOne({
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(req.user._id),
        });

        if(!projectMember) {
            throw new ApiError(404,"Project member not found");
        }

        const givenRole = projectMember?.role;

        req.user.role = givenRole;

        if(!roles.includes(givenRole)) {
            throw new ApiError(403,"You are not authorized to perform this action");
            //request blocked
        }

        next(); //request passed
        
    })
}