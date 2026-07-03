export const userRoleEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member",
}

export const AvailableUserRole = Object.values(userRoleEnum);

export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    DONE: "done"
}

export const AvailableTaskStatus = Object.values(TaskStatusEnum);

//This is a file in which we can keep constant data like positions and then if we want to increase the roles we can easily do it in the future

//This helps mitigate the typo errors very well like using two different forms of the samething at different places which will cause errors