import mongoose from "mongoose";


const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB Connected sucessfully");
    }
    catch(err) {
        console.log("Mongo connection error", err);
        process.exit(1);
    }
}

export default connectDB;