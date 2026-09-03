import Avatar from "./ui/Avatar";
import StatusPill from "./ui/StatusPill";

const TaskCard = ({ task, showProject = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-2xl border border-border p-5 ${
        onClick ? "cursor-pointer hover:shadow-md hover:border-brand-100" : ""
      } transition-all`}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-[15px] font-semibold text-brand-600 truncate">
          {task.title}
        </h4>
        <StatusPill status={task.status} className="shrink-0" />
      </div>

      {showProject && task.project?.name && (
        <span className="inline-block mt-1.5 text-[11px] font-medium text-ink-500 bg-app-bg rounded-full px-2 py-0.5">
          {task.project.name}
        </span>
      )}

      <p className="text-sm text-ink-500 mt-2.5 line-clamp-2">
        {task.description || "No description added."}
      </p>

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-ink-400">
          {new Date(task.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
        <Avatar user={task.assignedTo} size="xs" />
      </div>
    </div>
  );
};

export default TaskCard;
