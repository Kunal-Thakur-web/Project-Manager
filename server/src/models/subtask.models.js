import mongoose,{Schema} from "mongoose";
import { AvailableTaskStatus,TaskStatusEnum } from "../utils/constants";


const subTaskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    task: {
        type: Schema.Types.ObjectId,
        ref:"Task",
        required: true
    },
    status: {
        type:String,
        enum: AvailableTaskStatus,
        default: TaskStatusEnum.TODO
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{timestamps:true}
);

export const SubTask = mongoose.model("SubTask",subTaskSchema);