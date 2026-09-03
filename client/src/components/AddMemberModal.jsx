import { useState } from "react";
import Modal from "./ui/Modal";
import { projectApi } from "../api/project.api";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/getErrorMessage";

const ROLES = [
  { value: "member", label: "Member" },
  { value: "project_admin", label: "Project admin" },
];

const AddMemberModal = ({ open, onClose, projectId, onAdded }) => {
  const toast = useToast();
  const [form, setForm] = useState({ email: "", role: "member" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    setForm({ email: "", role: "member" });
    setError("");
    onClose?.();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    setSubmitting(true);
    try {
      await projectApi.addMember(projectId, form);
      toast.success("Member added to the project");
      onAdded?.();
      close();
    } catch (err) {
      setError(getErrorMessage(err, "Could not add member"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Add member">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink-700 mb-1.5 block">
            Member email
          </label>
          <input
            autoFocus
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="teammate@company.com"
            className="w-full px-3.5 py-2.5 rounded-xl bg-app-bg border border-border focus:border-brand-400 text-sm outline-none transition-colors"
          />
          <p className="text-xs text-ink-400 mt-1.5">
            They must already have an account in Project Manager.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-ink-700 mb-1.5 block">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-app-bg border border-border focus:border-brand-400 text-sm outline-none transition-colors"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
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
            {submitting ? "Adding..." : "Add member"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMemberModal;
