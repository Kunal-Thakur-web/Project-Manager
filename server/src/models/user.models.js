import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";



const userSchema = new Schema({
    avatar: {
        type: {
            url: String,
            localPath: String,
        },
        default: {
            url: `https://placehold.co/200x200`,
            localPath: "",
        },
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"], // this will actually pass the latter message when the condition is violated
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    refreshToken: { // will be further used for jwt tokens
        type: String,
    },
    forgotPassToken: {
        type: String,
    },
    forgotPassExpiry:{
        type: Date
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpiry: {
        type : Date
    }
}, { // first object is for the columns(fields) and the second object is for timeStamps and time series like things which you can study about in the docs
    timestamps: true, // this will keep timestamps that when was this table created at and updated at
}
);

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return;


    this.password = await bcrypt.hash(this.password, 10);
}); //This prehook will always run even when anything is updated in the schema even if password is not modifed and so we will use the first if operation to handle it.

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign( //Takes some parameter to genrate signed(with data) tokens in the form of an object
        { // this is actually the payload meaning the data we provide
            _id: this._id,
            email: this.email,
            username: this.username
        }, //then you have to provide the secret
        process.env.ACCESS_TOKEN_SECRET, //After this you have to provide the expiry time too.
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
};


userSchema.methods.generateRefreshToken = function() {
    return jwt.sign( //Takes some parameter to genrate signed(with data) tokens in the form of an object
        { // this is actually the payload meaning the data we provide
            _id: this._id
        }, //then you have to provide the secret
        process.env.REFRESH_TOKEN_SECRET, //After this you have to provide the expiry time too.
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
};

userSchema.methods.generateTemporaryToken = function() {
    const unHashed = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashed)
        .digest("hex")

    const tokenExpiry = Date.now() + (20*60*1000); //20mins
    return {unHashed,hashedToken,tokenExpiry};
}

export const User = mongoose.model("User", userSchema);