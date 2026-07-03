import Mailgen from "mailgen";
import { transporter } from "./emailTransporter.js";




const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Project Manager",
            link: "www.google.com"
        }
    });

    const emailTextual = mailGenerator.generatePlaintext(options.mailGenContent);

    const emailHtml = mailGenerator.generate(options.mailGenContent);

    const mail = {
        from: "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml,
    };

    try {
        await transporter.verify();
        console.log("SMTP Connection established");
        await transporter.sendMail(mail);
    } catch(err) {
        console.error("Email service failed silently. Make sure you have provided your credentials properly");
        console.error("Error:",  err.message ,"\n", err.code, "\n" , err.command, "\n", err.response);
    }
}



const emailVerificationContent = (username,verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to Project manager app! We're excited to have you on board",
            action: {
                instructions: "To verify your email please click on the following button",
                button: {
                    color: "#22BC66",
                    text: "Verify email",
                    link: verificationUrl,
                },
            },
            outro: "Need help or have questions? Reply to this email we would love to help"
        },
    };
};


const forgotPasswordContent = (username,passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "We got a request to reset your password",
            action: {
                instructions: "To reset your password please click on the following button",
                button: {
                    color: "#22BC66",
                    text: "Reset password",
                    link: passwordResetUrl,
                },
            },
            outro: "Need help or have questions? Reply to this email we would love to help"
        },
    };
};


export {emailVerificationContent,forgotPasswordContent,sendEmail};