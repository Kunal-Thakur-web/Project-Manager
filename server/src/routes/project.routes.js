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
} from "../controllers/project.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createProjectValidator, addMemberToProjectValidator } from "../validators/index.js";
import { AvailableUserRole, userRoleEnum } from "../utils/constants";


const router = Router();
router.use(verifyJWT); // all of the router now will have this middleware applied automatically


router.route("/")
    .get(getProjects)
    .post(
        validateProjectPermissions([userRoleEnum.ADMIN]),
        createProjectValidator(),
        validate, 
        createProject);


router
    .route("/:projectId")
    .get(validateProjectPermissions(AvailableUserRole),getProjectByID)
    .put(
        validateProjectPermissions([userRoleEnum.ADMIN]),
        createProjectValidator(), 
        validate, 
        updateProject
    )
    .delete(
        validateProjectPermissions([userRoleEnum.ADMIN]),
        deleteProject
    );


router
    .route("/:projectId/members/:userId")
    .get(getProjectMembers)
    .post(
        validateProjectPermissions([userRoleEnum.ADMIN]),
        addMemberToProjectValidator(),
        validate, 
        addProjectMember
    )
    .put(
        validateProjectPermissions([userRoleEnum.ADMIN]),
        addMemberToProjectValidator(),
        validate,
        updateProjectMemberRole
    )
    .delete(
        validateProjectPermissions([userRoleEnum.ADMIN]),
        deleteProjectMember
    );



export default router;