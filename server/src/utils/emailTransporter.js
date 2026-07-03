import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();


export const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.MAILTRAP_SMTP_USERNAME,
        pass: process.env.MAILTRAP_SMTP_PASSWORD,
    }
});