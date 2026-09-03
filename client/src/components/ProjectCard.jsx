import { Link } from "react-router-dom";
import ProgressBar from "./ui/ProgressBar";
import AvatarGroup from "./ui/AvatarGroup";
import StatusPill from "./ui/StatusPill";

const deriveStatus = (stats) => {
  if (!stats || stats.total === 0) return "todo";
  if (stats.done === stats.total) return "done";
  if (stats.done > 0 || stats.inProgress > 0) return "in_progress";
  return "todo";
};

const ProjectCard = ({ project }) => {
  const stats = project.taskStats;
  const status = deriveStatus(stats);

  return (
    <Link
      to={`/projects/${project._id}`}
      className="block bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:border-brand-100 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-brand-600 truncate">
            {project.name}
          </h3>
          <p className="text-xs text-ink-500 mt-0.5">
            {stats?.total ?? 0} {stats?.total === 1 ? "Task" : "Tasks"}
          </p>
        </div>
        <StatusPill status={status} className="shrink-0" />
      </div>

      <p className="text-sm text-ink-500 mt-3 line-clamp-2">
        {project.description || "No description provided for this project yet."}
      </p>

      <div className="mt-4">
        <ProgressBar stats={stats} />
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-ink-400">
          {project.members ?? 1} {project.members === 1 ? "member" : "members"}
        </span>
        <AvatarGroup users={project.memberAvatars || []} max={3} size="xs" />
      </div>
    </Link>
  );
};

export default ProjectCard;
