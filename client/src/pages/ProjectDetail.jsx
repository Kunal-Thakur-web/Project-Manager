import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiPlus,
  FiUserPlus,
  FiTrash2,
  FiMoreVertical,
  FiUsers,
} from "react-icons/fi";
import { projectApi } from "../api/project.api";
import { taskApi } from "../api/task.api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import Avatar from "../components/ui/Avatar";
import AvatarGroup from "../components/ui/AvatarGroup";
import { STATUS_META } from "../utils/statusMeta";
import CreateTaskModal from "../components/CreateTaskModal";
import AddMemberModal from "../components/AddMemberModal";
import { PageSpinner, EmptyState } from "../components/ui/Feedback";

const COLUMNS = [
  { key: "todo", title: "Not started" },
  { key: "in_progress", title: "In progress" },
  { key: "done", title: "Done" },
];

const BoardTaskCard = ({ task, canManage, onStatusChange, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border p-4 group">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-ink-900 leading-snug">{task.title}</h4>
        {canManage && (
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="text-ink-400 hover:text-ink-700 p-1 rounded-lg hover:bg-app-bg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Task options"
            >
              <FiMoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(task);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-status-todo hover:bg-app-bg"
                >
                  <FiTrash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-ink-500 mt-1.5 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-3">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task, e.target.value)}
          className="text-[11px] font-medium bg-app-bg border border-border rounded-lg px-2 py-1 outline-none focus:border-brand-400"
        >
          {COLUMNS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.title}
            </option>
          ))}
        </select>
        <Avatar user={task.assignedTo} size="xs" />
      </div>
    </div>
  );
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  const loadAll = async () => {
    try {
      const [projectRes, membersRes, tasksRes] = await Promise.all([
        projectApi.getById(projectId),
        projectApi.getMembers(projectId),
        taskApi.getForProject(projectId),
      ]);
      setProject(projectRes.data.data);
      setMembers(membersRes.data.data || []);
      setTasks(tasksRes.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load this project"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const myRole = useMemo(
    () => members.find((m) => m.user?._id === user?._id)?.role,
    [members, user]
  );
  const canManage = myRole === "admin" || myRole === "project_admin";

  const handleStatusChange = async (task, status) => {
    const prev = tasks;
    setTasks((cur) => cur.map((t) => (t._id === task._id ? { ...t, status } : t)));
    try {
      await taskApi.update(projectId, task._id, { status });
    } catch (error) {
      setTasks(prev);
      toast.error(getErrorMessage(error, "Could not update task status"));
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;
    try {
      await taskApi.remove(projectId, task._id);
      setTasks((cur) => cur.filter((t) => t._id !== task._id));
      toast.success("Task deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete task"));
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Delete "${project.name}" and all of its tasks?`)) return;
    try {
      await projectApi.remove(projectId);
      toast.success("Project deleted");
      navigate("/projects");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete project"));
    }
  };

  if (loading) return <PageSpinner />;
  if (!project) {
    return (
      <EmptyState title="Project not found" description="It may have been removed, or you don't have access to it." />
    );
  }

  return (
    <div>
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-4"
      >
        <FiArrowLeft size={15} /> Back to projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-ink-900 truncate">{project.name}</h1>
          <p className="text-ink-500 text-sm mt-1.5 max-w-2xl">
            {project.description || "No description provided for this project yet."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
            <FiUsers className="text-ink-400" size={15} />
            <AvatarGroup users={members.map((m) => m.user)} max={4} size="xs" />
          </div>
          {canManage && (
            <>
              <button
                onClick={() => setMemberModalOpen(true)}
                className="flex items-center gap-2 bg-card border border-border hover:border-brand-200 text-ink-700 text-sm font-medium rounded-xl px-3.5 py-2.5 transition-colors"
              >
                <FiUserPlus size={15} /> Add member
              </button>
              <button
                onClick={handleDeleteProject}
                className="flex items-center gap-2 text-status-todo hover:bg-status-todo-bg text-sm font-medium rounded-xl px-3 py-2.5 transition-colors"
                aria-label="Delete project"
              >
                <FiTrash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-ink-900">Tasks</h2>
        <button
          onClick={() => setTaskModalOpen(true)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-colors"
        >
          <FiPlus size={16} /> New task
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          const meta = STATUS_META[col.key];
          return (
            <div key={col.key} className="bg-app-bg/60 rounded-2xl p-3">
              <div className="flex items-center gap-2 px-2 py-2">
                <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                <h3 className="text-sm font-semibold text-ink-700">{col.title}</h3>
                <span className="text-xs text-ink-400">{colTasks.length}</span>
              </div>
              <div className="space-y-3 mt-1">
                {colTasks.length === 0 ? (
                  <p className="text-xs text-ink-400 px-2 py-6 text-center">No tasks here</p>
                ) : (
                  colTasks.map((task) => (
                    <BoardTaskCard
                      key={task._id}
                      task={task}
                      canManage={canManage}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        projectId={projectId}
        members={members}
        onCreated={(task) => setTasks((prev) => [task, ...prev])}
      />

      <AddMemberModal
        open={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        projectId={projectId}
        onAdded={loadAll}
      />
    </div>
  );
};

export default ProjectDetail;
