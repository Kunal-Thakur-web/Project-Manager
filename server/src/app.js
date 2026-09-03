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
const corsOriginEnv = process.env.CORS_ORIGIN?.trim();
const corsOrigin =
    !corsOriginEnv || corsOriginEnv === "*"
        ? true // reflect the request's own origin - works with credentials, unlike a literal "*"
        : corsOriginEnv.split(",").map((o) => o.trim());

app.use(
    cors({
    origin: corsOrigin, //5173 is used for vite applications. This defines all the permitted origins for loading resources.
    credentials: true, // required to work on cookies.
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"], //http methods enabled
    allowedHeaders: ["Content-Type", "Authorization"] //headers allowed
}));

import healthCheckRouter from "./routes/healthCheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";


app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);


app.get("/" ,(req,res) => {
    res.send("Home page");
});

// Global JSON error handler - without this, thrown ApiErrors would be rendered
// by Express's default HTML error page instead of the JSON shape the client expects.
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        statusCode,
        data: err.data ?? null,
        message: err.message || "Something went wrong",
        success: false,
        errors: err.errors || [],
    });
});

export default app;