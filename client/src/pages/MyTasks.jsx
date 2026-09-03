import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { taskApi } from "../api/task.api";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import TaskCard from "../components/TaskCard";
import { PageSpinner, EmptyState } from "../components/ui/Feedback";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "todo", label: "Not started" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
];

const MyTasks = () => {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await taskApi.getMyTasks();
        setTasks(data.data || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Could not load your tasks"));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? tasks : tasks.filter((t) => t.status === filter)),
    [tasks, filter]
  );

  if (loading) return <PageSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">My Tasks</h1>
        <p className="text-ink-500 text-sm mt-1">
          Everything assigned to you, across all your projects.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors ${
              filter === f.key
                ? "bg-brand-500 text-white"
                : "bg-card border border-border text-ink-500 hover:text-ink-900"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border">
          <EmptyState
            icon={<FiCheckCircle size={22} />}
            title="No tasks here"
            description="Tasks assigned to you will show up in this list."
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard key={task._id} task={task} showProject />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
