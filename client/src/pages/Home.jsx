import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiFolder, FiCheckCircle, FiClock, FiList, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { projectApi } from "../api/project.api";
import { taskApi } from "../api/task.api";
import { getErrorMessage } from "../utils/getErrorMessage";
import ProjectCard from "../components/ProjectCard";
import TaskCard from "../components/TaskCard";
import CreateProjectModal from "../components/CreateProjectModal";
import { PageSpinner, EmptyState } from "../components/ui/Feedback";

const StatCard = ({ icon, label, value, tint }) => (
  <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tint}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-ink-900 leading-none">{value}</p>
      <p className="text-xs text-ink-500 mt-1.5">{label}</p>
    </div>
  </div>
);

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Home = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const loadData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        projectApi.getAll(),
        taskApi.getMyTasks(),
      ]);
      setProjects(projectsRes.data.data || []);
      setTasks(tasksRes.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load your dashboard"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <PageSpinner />;

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">
            {greeting()}, {user?.fullName?.split(" ")[0] || user?.username}
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Here&apos;s what&apos;s happening across your projects today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FiFolder className="text-brand-500" size={20} />}
          label="Active projects"
          value={projects.length}
          tint="bg-brand-50"
        />
        <StatCard
          icon={<FiList className="text-ink-500" size={20} />}
          label="Tasks assigned to you"
          value={totalTasks}
          tint="bg-app-bg"
        />
        <StatCard
          icon={<FiClock className="text-status-progress" size={20} />}
          label="In progress"
          value={inProgressTasks}
          tint="bg-status-progress-bg"
        />
        <StatCard
          icon={<FiCheckCircle className="text-status-done" size={20} />}
          label="Completed"
          value={doneTasks}
          tint="bg-status-done-bg"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Projects */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-ink-900">Projects</h2>
              <span className="text-xs font-semibold bg-ink-900 text-white rounded-full px-2 py-0.5">
                +{projects.length}
              </span>
              <Link to="/projects" className="text-ink-400 hover:text-brand-500">
                <FiArrowRight size={16} />
              </Link>
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors"
              aria-label="Create project"
            >
              <FiPlus size={16} />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border">
              <EmptyState
                icon={<FiFolder size={22} />}
                title="No projects yet"
                description="Create your first project to start organizing tasks for your team."
                action={
                  <button
                    onClick={() => setCreateOpen(true)}
                    className="text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl px-4 py-2 transition-colors"
                  >
                    New project
                  </button>
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 3).map(({ project }) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </section>

        {/* My tasks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-ink-900">My Tasks</h2>
              <span className="text-xs font-semibold bg-ink-900 text-white rounded-full px-2 py-0.5">
                {tasks.length}
              </span>
              <Link to="/my-tasks" className="text-ink-400 hover:text-brand-500">
                <FiArrowRight size={16} />
              </Link>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border">
              <EmptyState
                icon={<FiCheckCircle size={22} />}
                title="Nothing assigned to you"
                description="Tasks assigned to you across every project will show up here."
              />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {tasks.slice(0, 4).map((task) => (
                <TaskCard key={task._id} task={task} showProject />
              ))}
            </div>
          )}
        </section>
      </div>

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(project) => {
          setProjects((prev) => [{ project, role: "project_admin" }, ...prev]);
        }}
      />
    </div>
  );
};

export default Home;
