import { useState } from "react";
import Modal from "./ui/Modal";
import { projectApi } from "../api/project.api";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/getErrorMessage";

const CreateProjectModal = ({ open, onClose, onCreated }) => {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    setForm({ name: "", description: "" });
    setError("");
    onClose?.();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Project name is required");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await projectApi.create(form);
      toast.success("Project created");
      onCreated?.(data.data);
      close();
    } catch (err) {
      setError(getErrorMessage(err, "Could not create project"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="New project">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink-700 mb-1.5 block">
            Project name
          </label>
          <input
            autoFocus
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Website Redesign"
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
            placeholder="What is this project about?"
            className="w-full px-3.5 py-2.5 rounded-xl bg-app-bg border border-border focus:border-brand-400 text-sm outline-none transition-colors resize-none"
          />
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
            {submitting ? "Creating..." : "Create project"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
