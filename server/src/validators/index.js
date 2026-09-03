import {body} from "express-validator";
import { AvailableUserRole } from "../utils/constants.js";



const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email format is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username can not be empty")
            .isLength({min:3})
            .withMessage("Username must be atleast three characters long"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required"),
        body("fullname").optional().trim().notEmpty().withMessage("Full name should not be empty"),
    ]
};

const logginValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email can not be empty")
            .isEmail()
            .withMessage("Email is invalid"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
    ]
}


const resetCurrPassValidator = () => {
    return [
        body("oldPassword")
            .trim()
            .notEmpty()
            .withMessage("Old password is required to change it."),
        body("newPassword")
            .trim()
            .notEmpty()
            .withMessage("New password can not be empty")
    ]
}

const forgotPassValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email format is wrong")
    ]
}

const resetForgotPassValidator = () => {
    return [
        body("newPassword")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
    ]
}

const createProjectValidator = () => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Project name can not be empty"),
        body("description")
            .trim()
            .optional()
    ]
}

const addMemberToProjectValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email format is wrong"),
        body("role")
            .trim()
            .notEmpty()
            .withMessage("Role is required")
            .isIn(AvailableUserRole)
            .withMessage("Role is invalid")
    ]
}

const createTaskValidator = () => {
    return [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("Task title can not be empty"),
        body("description").trim().optional(),
        body("assignedTo").trim().optional(),
        body("status").trim().optional()
    ]
}



export {
    userRegisterValidator,
    logginValidator, 
    resetCurrPassValidator,
    forgotPassValidator,
    resetForgotPassValidator,
    createProjectValidator,
    addMemberToProjectValidator,
    createTaskValidator
};