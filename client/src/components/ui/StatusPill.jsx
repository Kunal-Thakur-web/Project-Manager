import { STATUS_META } from "../../utils/statusMeta";

const StatusPill = ({ status = "todo", className = "" }) => {
  const meta = STATUS_META[status] || STATUS_META.todo;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${meta.bg} ${meta.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

export default StatusPill;
