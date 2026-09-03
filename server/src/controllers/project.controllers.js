import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMember.models.js";
import APIResponse from "../utils/API-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AvailableUserRole, userRoleEnum } from "../utils/constants.js";
//Can add the email functionalities later on to like send emails to the members when a new project is made which have them as a part


const getProjects = asyncHandler(async (req,res) => {
    //Returns the projects of which the current logged in user is a part of

    const projects = await ProjectMember.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "projects",
                localField: "project",
                foreignField: "_id",
                as: "project",
                pipeline: [
                    {
                        $lookup: {
                            from: "projectmembers",
                            localField: "_id",
                            foreignField: "project",
                            as: "projectMembers"
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "projectMembers.user",
                            foreignField: "_id",
                            as: "memberUsers",
                            pipeline: [
                                { $project: { _id: 1, username: 1, fullName: 1, avatar: 1 } }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "tasks",
                            localField: "_id",
                            foreignField: "project",
                            as: "tasks"
                        }
                    },
                    {
                        $addFields: {
                            members: { $size: "$projectMembers" },
                            memberAvatars: "$memberUsers",
                            taskStats: {
                                total: { $size: "$tasks" },
                                todo: {
                                    $size: {
                                        $filter: { input: "$tasks", cond: { $eq: ["$$this.status", "todo"] } }
                                    }
                                },
                                inProgress: {
                                    $size: {
                                        $filter: { input: "$tasks", cond: { $eq: ["$$this.status", "in_progress"] } }
                                    }
                                },
                                done: {
                                    $size: {
                                        $filter: { input: "$tasks", cond: { $eq: ["$$this.status", "done"] } }
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$project"

        },
        {
            $project: {
                project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    members: 1,
                    memberAvatars: 1,
                    taskStats: 1,
                    createdAt: 1,
                    createdBy: 1
                },
                role: 1,
                _id: 0
            }
        }
    ]);


    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                projects,
                "Projects found successfully"
            )
        );
});


const getProjectByID = asyncHandler(async (req,res) => {
    const {projectId} = req.params;

    
    const project = await Project.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(projectId)
            }
        },
        {
            $lookup: {
                from: "projectmembers",
                localField: "_id",
                foreignField: "project",
                as: "projectMembers"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "projectMembers.user",
                foreignField: "_id",
                as: "memberUsers",
                pipeline: [
                    { $project: { _id: 1, username: 1, fullName: 1, avatar: 1 } }
                ]
            }
        },
        {
            $lookup: {
                from: "tasks",
                localField: "_id",
                foreignField: "project",
                as: "tasks"
            }
        },
        {
            $addFields: {
                members: { $size: "$projectMembers" },
                memberAvatars: "$memberUsers",
                taskStats: {
                    total: { $size: "$tasks" },
                    todo: {
                        $size: { $filter: { input: "$tasks", cond: { $eq: ["$$this.status", "todo"] } } }
                    },
                    inProgress: {
                        $size: { $filter: { input: "$tasks", cond: { $eq: ["$$this.status", "in_progress"] } } }
                    },
                    done: {
                        $size: { $filter: { input: "$tasks", cond: { $eq: ["$$this.status", "done"] } } }
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                createdAt: 1,
                createdBy: 1,
                members: 1,
                memberAvatars: 1,
                taskStats: 1
            }
        }
    ]);

    if(!project || project.length === 0) {
        throw new ApiError(404,"Project not found");
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                project[0],
                "Project found successfully"
            )
        );
});

const createProject = asyncHandler(async (req,res) => {
    const {name,description} = req.body;    

    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id)
    });

    await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: userRoleEnum.PROJECT_ADMIN
    });


    return res
        .status(201)
        .json(
            new APIResponse(
                201,
                project,
                "Project created successfully"
            )
        );


});

const updateProject = asyncHandler(async (req,res) => {
    const {name,description} = req.body;
    const {projectId} = req.params;


    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description
        },
        {new: true}
    );

    if(!project) {
        throw new ApiError(404,"Project not found");
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                project,
                "Project updated successfully"
            )
        );
});

const deleteProject = asyncHandler(async (req,res) => {
    const {projectId} = req.params;

    const project = await Project.findByIdAndDelete(projectId);

    if(!project) {
        throw new ApiError(404,"Project not found");
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                project,
                "Project deleted successfully"
            )
        );
});

const getProjectMembers = asyncHandler(async (req,res) => {
    const projectId = req.params.projectId;

    const project = await Project.findById(projectId);
    if(!project) {
        throw new ApiError(404,"Project not found");
    }

    const projectMembers = await ProjectMember.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
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
                user: {
                    $arrayElemAt: ["$user",0]
                }
            }
        },
        {
            $project: {
                project: 1,
                user: 1,
                role: 1,
                createdAt: 1,
                updatedAt: 1,
                _id: 0
            }
        }
    ])


    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                projectMembers,
                "Project members found successfully"
            )
        );
});

const addProjectMember = asyncHandler(async (req,res) => {
    const {email,role} = req.body;
    const projectId = req.params.projectId;

    const user = await User.findOne({email});
    if(!user) {
        throw new ApiError(404,"User not found");
    }

    const projectMember = await ProjectMember.create({
        user: new mongoose.Types.ObjectId(user._id),
        project: new mongoose.Types.ObjectId(projectId),
        role
    });

    return res
        .status(201)
        .json(
            new APIResponse(
                201,
                projectMember,
                "Project member added successfully"
            )
        );
});

const updateProjectMemberRole = asyncHandler(async (req,res) => {
    const {email,role} = req.body;
    const projectId = req.params.projectId;


    if(!AvailableUserRole.includes(role)) {
        throw new ApiError(400,"Invalid role");
    }

    const user = await User.findOne({email});
    if(!user) {
        throw new ApiError(404,"User not found");
    }

    const projectMember = await ProjectMember.findOne({
        user: new mongoose.Types.ObjectId(user._id),
        project: new mongoose.Types.ObjectId(projectId)
    });

    if(!projectMember) {
        throw new ApiError(404,"Project member not found");
    }   

    projectMember.role = role;
    const updatedMember = await projectMember.save({
        validateBeforeSave: false
    });

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                updatedMember,
                "Project member role updated successfully"
            )
        );
});

const deleteProjectMember = asyncHandler(async (req,res) => {
    const {email} = req.body;
    const projectId = req.params.projectId;


    const user = await User.findOne({email});
    if(!user) {
        throw new ApiError(404,"User not found");
    }

    const projectMember = await ProjectMember.findOne({
        user: new mongoose.Types.ObjectId(user._id),
        project: new mongoose.Types.ObjectId(projectId)
    });

    if(!projectMember) {
        throw new ApiError(404,"Project member not found");
    }

    await ProjectMember.findByIdAndDelete(projectMember._id);

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                projectMember,
                "Project member deleted successfully"
            )
        );
});


export {
    getProjects,
    getProjectByID,
    createProject,
    updateProject,
    deleteProject,
    getProjectMembers,
    addProjectMember,
    updateProjectMemberRole,
    deleteProjectMember
};