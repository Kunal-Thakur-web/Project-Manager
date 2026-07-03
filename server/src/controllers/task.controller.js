import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { SubTask }  from "../models/subtask.models.js";
import APIResponse from "../utils/API-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AvailableUserRole, userRoleEnum } from "../utils/constants.js";


const getTasks = asyncHandler(async (req,res) => {
    const {projectId} = req.params;
    const project = await Project.findById(projectId);
    if(!project) {
        throw new ApiError(404,"Project not found");
    }

    const tasks = await Task.find({project: new mongoose.Types.ObjectId(project._id)}).populate("assignedTo", "username fullName email");

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                tasks,
                "Tasks fetched successfully"
            )
        );

});


const createTask = asyncHandler(async (req,res) => {
    const {title,description,assignedTo,status} = req.body;
    const {projectId} = req.params;

    const project = await Project.findById(projectId);
    if(!project) {
        throw new ApiError(404,"Project not found");
    }

    const task = await Task.create({
        title,
        description,
        project: new mongoose.Types.ObjectId(project._id),
        assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        status
    });

    return res
        .status(201)
        .json(
            new APIResponse(
                201,
                task,
                "Task created successfully"
            )
        );
});

const updateTask = asyncHandler(async (req,res) => {

});


const getTaskById = asyncHandler(async (req,res) => {
    const {taskId} = req.params;

    const task = await Task.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            email: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subtasks",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "createdBy",
                            foreignField: "_id",
                            as: "createdBy",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        fullName: 1,
                                        email: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            createdBy: {
                                $arrayElemAt: ["$createdBy",0]
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                assignedTo: {
                    $arrayElemAt: ["$assignedTo",0]
                }
            }
        }
    ]);


    if(!task || task.length === 0) {
        throw new ApiError(404,"Task not found");
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                task[0],
                "Task fetched successfully"
            )
        );
});


const deleteTask = asyncHandler(async (req,res) => {

});


const createSubTask = asyncHandler(async (req,res) => {

});

const updateSubTask = asyncHandler(async (req,res) => {

});

const deleteSubTask = asyncHandler(async (req,res) => {

});


export{
    getTasks,
    createTask,
    updateTask,
    getTaskById,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask
}




