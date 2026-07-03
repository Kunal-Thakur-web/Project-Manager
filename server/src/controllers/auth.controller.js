import { User } from "../models/user.models.js";
import APIResponse from "../utils/API-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationContent, sendEmail, forgotPasswordContent } from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return{accessToken,refreshToken}
    } catch(err) {
        throw new ApiError(500,"Something went wrong while generating access token",[]);
    }
}

const registerUser = asyncHandler(async (req,res) => {
    const {email,username,password,role} = req.body;

    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    });

    if(existingUser) {
        throw new ApiError(409, "Email with username or email already exists", []);
    }
    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false,
    });

    const {unHashed,hashedToken,tokenExpiry} = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});

    await sendEmail({
        email:user?.email,
        subject: "Please verify your email",
        mailGenContent: emailVerificationContent(
            user.username, 
            `${req.protocol}://localhost/api/v1/users/verify-email/${unHashed}`
        ),
    });

    const createdUser = await User.findById(user._id).select( // put here whatever you do not want to return to the user
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    if(!createdUser) {
        throw new ApiError(500,"Something went wrong while registering the user");
    }

    return res
        .status(201)
        .json(
            new APIResponse(
                200,
                {user: createdUser},
                "User registered successfully and verification email has been sent on the given email"
            )
        )
});

const login = asyncHandler(async (req,res) => {
    const {email,password,username} = req.body;

    if(!email) {
        throw new ApiError(400,"Email is required for login");
    }

    const user = await User.findOne({ email });

    if(!user) {
        throw new ApiError(400, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(400,"Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    user.refreshToken = refreshToken;

    user.save({validateBeforeSave:false});

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken" ,accessToken, options)
        .cookie("refreshToken", refreshToken,options)
        .json(
            new APIResponse(
                200, 
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
});

const logout = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: ""
            }
        },
        {
            new:true,
        },
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new APIResponse(200, {}, "User logged out")
        )
});


const getCurrentUser = asyncHandler(async (req,res) => {
    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                req.user,
                "Current user fetched successfully"
            )
        )
});




const verifyEmail = asyncHandler(async (req,res) => {
    const {verificationToken} = req.params;

    if(!verificationToken) {
        throw new ApiError(400, "Email verification token is missing");
    }

    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")


    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: {$gt: Date.now()}
    });

    if(!user) {
        throw new ApiError(400,"Token is invalid or expired");
    }

    user.isEmailVerified = true;
    user.emailVerificationExpiry = undefined;
    user.emailVerificationToken = undefined;

    await user.save({validateBeforeSave: false});


    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                {
                    isEmailVerified: true,
                },
                "Email is verified!",
            )
        )
});


const resendEmailVerification = asyncHandler(async (req,res) => {
    const user = await User.findById(req.user._id);

    if(!user) {
        throw new ApiError(404, "User does not exist");
    }

    if(user.isEmailVerified) {
        throw new ApiError(409, "Email is already verified!");
    }

    const {unHashed,hashedToken,tokenExpiry} = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});

    await sendEmail({
        email:user?.email,
        subject: "Please verify your email",
        mailGenContent: emailVerificationContent(
            user.username, 
            `${req.protocol}://localhost/api/v1/users/verify-email/${unHashed}`
        ),
    });


    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                {},
                "Mail has been sent to your email ID"
            )
        );
});



const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized access");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);


        const user = await User.findById(decodedToken?._id);

        if(!user) {
            throw new ApiError(401, "Invalid refresh token");
        }


        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,"Refresh token is expired!")
        }

        const options = {
            httpOnly: true,
            secure: true,
        }


        const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id);

        user.refreshToken = newRefreshToken;
        user.save({validateBeforeSave: false});

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new APIResponse(
                    200,
                    {"Access Token": accessToken, "Refresh Token": newRefreshToken},
                    "Access token refreshed"
                )
            )
    } catch(err) {
        throw new ApiError(401, "Invalid refresh token");
    }
});


const forgotPassword = asyncHandler(async (req,res) => {
    const {email} = req.body;

    const user = await User.findOne({email});

    if(!user) {
        throw new ApiError(404,"User does not exist!");
    }

    const {unHashed, hashedToken, tokenExpiry} = user.generateTemporaryToken();


    user.forgotPassToken = hashedToken;
    user.forgotPassExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});

    await sendEmail({
        email:user?.email,
        subject: "Password reset request",
        mailGenContent: forgotPasswordContent(
            user.username, 
            `${req.protocol}://localhost/api/v1/users/forgot-password/${unHashed}`
        ),
    });

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                {},
                "Password reset mail has been sent on your mail id."
            )
        )
});



const resetForgotPassword = asyncHandler(async (req,res) => {
    const {resetToken} = req.params;
    const {newPassword} = req.body;

    let hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    const user = await User.findOne({
        forgotPassToken: hashedToken,
        forgotPassExpiry: {$gt: Date.now()}
    });

    if(!user) {
        throw new ApiError(489,"Token is invalid or expired");
    }

    user.forgotPassExpiry = undefined;
    user.forgotPassToken = undefined;

    user.password = newPassword;

    await user.save({validateBeforeSave : false});

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                {},
                "Password has been changed"
            )
        )
});


const resetCurrentPassword = asyncHandler(async (req,res) => {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);

    if(!user) {
        throw new ApiError(404, "User not found!");
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordValid) {
        throw new ApiError(400,"Invalid old password");
    }

    user.password = newPassword;

    await user.save({validateBeforeSave:false});


    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                {},
                "Password changed successfully"
            )
        );
});


export {registerUser, login, logout, getCurrentUser,verifyEmail,resendEmailVerification,refreshAccessToken, forgotPassword, resetForgotPassword, resetCurrentPassword};
