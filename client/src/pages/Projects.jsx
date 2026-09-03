import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiFolder, FiSearch } from "react-icons/fi";
import { projectApi } from "../api/project.api";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import ProjectCard from "../components/ProjectCard";
import CreateProjectModal from "../components/CreateProjectModal";
import { PageSpinner, EmptyState } from "../components/ui/Feedback";

const Projects = () => {
  const toast = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const loadProjects = async () => {
    try {
      const { data } = await projectApi.getAll();
      setEntries(data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load projects"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(({ project }) =>
      project.name?.toLowerCase().includes(q) ||
      project.description?.toLowerCase().includes(q)
    );
  }, [entries, query]);

  if (loading) return <PageSpinner />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Projects</h1>
          <p className="text-ink-500 text-sm mt-1">
            Every project you're a part of, in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 bg-card border border-border rounded-xl px-3.5 py-2.5 w-64">
            <FiSearch className="text-ink-400" size={16} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects..."
              className="bg-transparent outline-none text-sm w-full placeholder:text-ink-400"
            />
          </label>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-colors whitespace-nowrap"
          >
            <FiPlus size={16} />
            New project
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border">
          <EmptyState
            icon={<FiFolder size={22} />}
            title={entries.length === 0 ? "No projects yet" : "No matches found"}
            description={
              entries.length === 0
                ? "Create your first project to start assigning tasks to your team."
                : "Try a different search term."
            }
            action={
              entries.length === 0 && (
                <button
                  onClick={() => setCreateOpen(true)}
                  className="text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl px-4 py-2 transition-colors"
                >
                  New project
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(({ project }) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(project) => {
          setEntries((prev) => [{ project, role: "project_admin" }, ...prev]);
        }}
      />
    </div>
  );
};

export default Projects;
