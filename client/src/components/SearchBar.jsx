import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiFolder, FiLoader } from "react-icons/fi";
import { projectApi } from "../api/project.api";
import { taskApi } from "../api/task.api";
import { STATUS_META } from "../utils/statusMeta";

const MAX_PER_GROUP = 5;

const SearchBar = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Pull a fresh snapshot of projects + my tasks whenever the box is focused,
  // then filter entirely in the browser as the person types.
  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        projectApi.getAll(),
        taskApi.getMyTasks(),
      ]);
      setProjects((projectsRes.data.data || []).map((entry) => entry.project));
      setTasks(tasksRes.data.data || []);
    } catch {
      // Search staying empty on failure is an acceptable degrade - the rest
      // of the app already surfaces toast errors for real data operations.
    } finally {
      setLoading(false);
      setLoadedOnce(true);
    }
  };

  const handleFocus = () => {
    setOpen(true);
    loadData();
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const matchedProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return projects
      .filter(
        (p) =>
          p?.name?.toLowerCase().includes(q) ||
          p?.description?.toLowerCase().includes(q)
      )
      .slice(0, MAX_PER_GROUP);
  }, [projects, query]);

  const matchedTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tasks
      .filter(
        (t) =>
          t?.title?.toLowerCase().includes(q) ||
          t?.description?.toLowerCase().includes(q)
      )
      .slice(0, MAX_PER_GROUP);
  }, [tasks, query]);

  // Flat list so arrow keys can move through both groups seamlessly.
  const flatResults = useMemo(
    () => [
      ...matchedProjects.map((p) => ({ type: "project", data: p })),
      ...matchedTasks.map((t) => ({ type: "task", data: t })),
    ],
    [matchedProjects, matchedTasks]
  );

  const goToResult = (result) => {
    if (!result) return;
    if (result.type === "project") {
      navigate(`/projects/${result.data._id}`);
    } else {
      const projectId = result.data.project?._id;
      if (projectId) navigate(`/projects/${projectId}`);
    }
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!open || flatResults.length === 0) {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? flatResults.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      goToResult(flatResults[activeIndex] ?? flatResults[0]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative hidden md:block w-64">
      <label className="flex items-center gap-2 bg-app-bg rounded-full px-4 py-2 w-full">
        <FiSearch className="text-ink-400" size={16} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search projects & tasks..."
          className="bg-transparent outline-none text-sm w-full placeholder:text-ink-400"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="navbar-search-results"
          autoComplete="off"
        />
        {loading && <FiLoader className="text-ink-400 animate-spin" size={14} />}
      </label>

      {showDropdown && (
        <div
          id="navbar-search-results"
          className="absolute left-0 right-0 mt-2 bg-card rounded-xl border border-border shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto"
        >
          {!loadedOnce && loading ? (
            <p className="px-4 py-6 text-sm text-ink-400 text-center">Searching...</p>
          ) : flatResults.length === 0 ? (
            <p className="px-4 py-6 text-sm text-ink-400 text-center">
              No results for &quot;{query.trim()}&quot;
            </p>
          ) : (
            <>
              {matchedProjects.length > 0 && (
                <div className="py-1.5">
                  <p className="px-4 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    Projects
                  </p>
                  {matchedProjects.map((project, i) => {
                    const flatIdx = i;
                    return (
                      <button
                        key={project._id}
                        onMouseEnter={() => setActiveIndex(flatIdx)}
                        onClick={() => goToResult({ type: "project", data: project })}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          activeIndex === flatIdx ? "bg-app-bg" : "hover:bg-app-bg"
                        }`}
                      >
                        <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
                          <FiFolder size={15} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-ink-900 truncate">
                            {project.name}
                          </span>
                          {project.description && (
                            <span className="block text-xs text-ink-400 truncate">
                              {project.description}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {matchedTasks.length > 0 && (
                <div className="py-1.5 border-t border-border">
                  <p className="px-4 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    My tasks
                  </p>
                  {matchedTasks.map((task, i) => {
                    const flatIdx = matchedProjects.length + i;
                    const meta = STATUS_META[task.status] || STATUS_META.todo;
                    return (
                      <button
                        key={task._id}
                        onMouseEnter={() => setActiveIndex(flatIdx)}
                        onClick={() => goToResult({ type: "task", data: task })}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          activeIndex === flatIdx ? "bg-app-bg" : "hover:bg-app-bg"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-ink-900 truncate">
                            {task.title}
                          </span>
                          {task.project?.name && (
                            <span className="block text-xs text-ink-400 truncate">
                              {task.project.name}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
