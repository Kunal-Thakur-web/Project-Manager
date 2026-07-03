import APIResponse from "../utils/API-response.js";
import { asyncHandler } from "../utils/async-handler.js";


const healthCheck = asyncHandler(
    async (req,res) => {
        res.status(200).json(
            new APIResponse(200,{message: "Server is running"})
        )
    }
);

export default healthCheck;