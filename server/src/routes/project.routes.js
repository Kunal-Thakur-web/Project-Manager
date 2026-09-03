import { Router } from "express";
import { verifyJWT,validateProjectPermissions } from "../middlewares/auth.middleware.js";
import { 
    getProjects,
    getProjectByID,
    createProject,
    updateProject,
    deleteProject,
    getProjectMembers,
    addProjectMember,
    updateProjectMemberRole,
    deleteProjectMember
} from "../controllers/project.controllers.js";
import {
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask
} from "../controllers/task.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createProjectValidator, addMemberToProjectValidator, createTaskValidator } from "../validators/index.js";
import { AvailableUserRole, userRoleEnum } from "../utils/constants.js";


const router = Router();
router.use(verifyJWT); // all of the router now will have this middleware applied automatically


// Any authenticated user can create a project - they become its project_admin automatically
router.route("/")
    .get(getProjects)
    .post(
        createProjectValidator(),
        validate,
        createProject
    );


router
    .route("/:projectId")
    .get(validateProjectPermissions(AvailableUserRole),getProjectByID)
    .put(
        validateProjectPermissions([userRoleEnum.ADMIN, userRoleEnum.PROJECT_ADMIN]),
        createProjectValidator(), 
        validate, 
        updateProject
    )
    .delete(
        validateProjectPermissions([userRoleEnum.ADMIN, userRoleEnum.PROJECT_ADMIN]),
        deleteProject
    );


router
    .route("/:projectId/members")
    .get(validateProjectPermissions(AvailableUserRole), getProjectMembers)
    .post(
        validateProjectPermissions([userRoleEnum.ADMIN, userRoleEnum.PROJECT_ADMIN]),
        addMemberToProjectValidator(),
        validate, 
        addProjectMember
    );

router
    .route("/:projectId/members/:userId")
    .put(
        validateProjectPermissions([userRoleEnum.ADMIN, userRoleEnum.PROJECT_ADMIN]),
        addMemberToProjectValidator(),
        validate,
        updateProjectMemberRole
    )
    .delete(
        validateProjectPermissions([userRoleEnum.ADMIN, userRoleEnum.PROJECT_ADMIN]),
        deleteProjectMember
    );


router
    .route("/:projectId/tasks")
    .get(validateProjectPermissions(AvailableUserRole), getTasks)
    .post(
        validateProjectPermissions([userRoleEnum.ADMIN, userRoleEnum.PROJECT_ADMIN]),
        createTaskValidator(),
        validate,
        createTask
    );

router
    .route("/:projectId/tasks/:taskId")
    .get(validateProjectPermissions(AvailableUserRole), getTaskById)
    .put(validateProjectPermissions(AvailableUserRole), updateTask)
    .delete(
        validateProjectPermissions([userRoleEnum.ADMIN, userRoleEnum.PROJECT_ADMIN]),
        deleteTask
    );



export default router;