import mongoose from "mongoose";
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

    const tasks = await Task.find({project: new mongoose.Types.ObjectId(project._id)})
        .populate("assignedTo", "username fullName email avatar")
        .populate("assignedBy", "username fullName email avatar")
        .sort({createdAt: -1});

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


// Tasks assigned to the currently logged in user, across every project they belong to.
// Powers the "My Tasks" section of the dashboard.
const getMyTasks = asyncHandler(async (req,res) => {
    const tasks = await Task.aggregate([
        {
            $match: {
                assignedTo: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "projects",
                localField: "project",
                foreignField: "_id",
                as: "project",
                pipeline: [
                    { $project: { _id: 1, name: 1 } }
                ]
            }
        },
        {
            $addFields: {
                project: { $arrayElemAt: ["$project", 0] }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

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
        assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : req.user._id,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        status
    });

    const populatedTask = await Task.findById(task._id)
        .populate("assignedTo", "username fullName email avatar")
        .populate("assignedBy", "username fullName email avatar");

    return res
        .status(201)
        .json(
            new APIResponse(
                201,
                populatedTask,
                "Task created successfully"
            )
        );
});

const updateTask = asyncHandler(async (req,res) => {
    const {taskId} = req.params;
    const {title,description,assignedTo,status} = req.body;

    const task = await Task.findById(taskId);
    if(!task) {
        throw new ApiError(404,"Task not found");
    }

    if(title !== undefined) task.title = title;
    if(description !== undefined) task.description = description;
    if(assignedTo !== undefined) task.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    if(status !== undefined) task.status = status;

    await task.save();

    const populatedTask = await Task.findById(task._id)
        .populate("assignedTo", "username fullName email avatar")
        .populate("assignedBy", "username fullName email avatar");

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                populatedTask,
                "Task updated successfully"
            )
        );
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
                            email: 1,
                            avatar: 1
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
    const {taskId} = req.params;

    const task = await Task.findByIdAndDelete(taskId);

    if(!task) {
        throw new ApiError(404,"Task not found");
    }

    await SubTask.deleteMany({task: task._id});

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                task,
                "Task deleted successfully"
            )
        );
});


const createSubTask = asyncHandler(async (req,res) => {
    const {taskId} = req.params;
    const {title} = req.body;

    const task = await Task.findById(taskId);
    if(!task) {
        throw new ApiError(404,"Task not found");
    }

    const subTask = await SubTask.create({
        title,
        task: task._id,
        createdBy: req.user._id
    });

    return res
        .status(201)
        .json(
            new APIResponse(201, subTask, "Sub task created successfully")
        );
});

const updateSubTask = asyncHandler(async (req,res) => {
    const {subTaskId} = req.params;
    const {title,status} = req.body;

    const subTask = await SubTask.findById(subTaskId);
    if(!subTask) {
        throw new ApiError(404,"Sub task not found");
    }

    if(title !== undefined) subTask.title = title;
    if(status !== undefined) subTask.status = status;

    await subTask.save();

    return res
        .status(200)
        .json(
            new APIResponse(200, subTask, "Sub task updated successfully")
        );
});

const deleteSubTask = asyncHandler(async (req,res) => {
    const {subTaskId} = req.params;

    const subTask = await SubTask.findByIdAndDelete(subTaskId);
    if(!subTask) {
        throw new ApiError(404,"Sub task not found");
    }

    return res
        .status(200)
        .json(
            new APIResponse(200, subTask, "Sub task deleted successfully")
        );
});


export{
    getTasks,
    getMyTasks,
    createTask,
    updateTask,
    getTaskById,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask
}
