import { useState } from "react";
import Modal from "./ui/Modal";
import { taskApi } from "../api/task.api";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/getErrorMessage";

const CreateTaskModal = ({ open, onClose, projectId, members, onCreated }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: "todo",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    setForm({ title: "", description: "", assignedTo: "", status: "todo" });
    setError("");
    onClose?.();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Task title is required");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      const { data } = await taskApi.create(projectId, payload);
      toast.success("Task created");
      onCreated?.(data.data);
      close();
    } catch (err) {
      setError(getErrorMessage(err, "Could not create task"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="New task">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink-700 mb-1.5 block">Title</label>
          <input
            autoFocus
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Design the landing page"
            className="w-full px-3.5 py-2.5 rounded-xl bg-app-bg border border-border focus:border-brand-400 text-sm outline-none transition-colors"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink-700 mb-1.5 block">
            Description <span className="text-ink-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Add more detail for the assignee"
            className="w-full px-3.5 py-2.5 rounded-xl bg-app-bg border border-border focus:border-brand-400 text-sm outline-none transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-ink-700 mb-1.5 block">Assignee</label>
            <select
              value={form.assignedTo}
              onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-app-bg border border-border focus:border-brand-400 text-sm outline-none transition-colors"
            >
              <option value="">Myself</option>
              {members.map((m) => (
                <option key={m.user?._id} value={m.user?._id}>
                  {m.user?.fullName || m.user?.username}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 mb-1.5 block">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-app-bg border border-border focus:border-brand-400 text-sm outline-none transition-colors"
            >
              <option value="todo">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        {error && <p className="text-xs text-status-todo">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={close}
            className="text-sm font-medium text-ink-700 px-4 py-2.5 rounded-xl hover:bg-app-bg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-60 rounded-xl px-4 py-2.5 transition-colors"
          >
            {submitting ? "Creating..." : "Create task"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
