const ProgressBar = ({ stats }) => {
  const total = stats?.total || 0;
  const done = stats?.done || 0;
  const inProgress = stats?.inProgress || 0;
  const todo = stats?.todo || 0;

  if (total === 0) {
    return <div className="h-2 w-full rounded-full bg-track" />;
  }

  const donePct = (done / total) * 100;
  const progressPct = (inProgress / total) * 100;
  const todoPct = (todo / total) * 100;

  return (
    <div className="group relative">
      <div className="h-2 w-full rounded-full bg-track overflow-hidden flex">
        {donePct > 0 && (
          <div className="h-full bg-status-done" style={{ width: `${donePct}%` }} />
        )}
        {progressPct > 0 && (
          <div className="h-full bg-status-progress" style={{ width: `${progressPct}%` }} />
        )}
        {todoPct > 0 && (
          <div className="h-full bg-status-todo" style={{ width: `${todoPct}%` }} />
        )}
      </div>
      {done > 0 && (
        <div
          className="absolute -top-7 -translate-x-1/2 bg-ink-900 text-white text-[11px] font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
          style={{ left: `${Math.max(donePct / 2, 4)}%` }}
        >
          {done} Done
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
