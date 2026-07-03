import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// basic configuration for our server
app.use(express.json({limit: "16kb"})); // allows our server to accept data in the json format
app.use(express.urlencoded({extended: true, limit: "16kb"})); // accepts data in urlencoded form
app.use(express.static("public")); // allows our static data like images to be publically viewable specifying the folder used for the static assets.
app.use(cookieParser());

//CORS configuration
app.use(
    cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173", //5173 is used for vite applications. This defines all the permitted origins for loading resources. The ? is there to check if the split function can work or not
    credentials: true, // required t work on cookies.
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"], //http methods enabled
    allowedHeaders: ["Content-Type", "Authorization"] //headers allowed
}));

import healthCheckRouter from "./routes/healthCheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";


app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);


app.get("/" ,(req,res) => {
    res.send("Home page");
});

export default app;