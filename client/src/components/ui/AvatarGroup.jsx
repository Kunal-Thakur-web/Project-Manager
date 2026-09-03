import Avatar from "./Avatar";

const AvatarGroup = ({ users = [], max = 3, size = "sm" }) => {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((u, i) => (
        <Avatar key={u?._id || i} user={u} size={size} />
      ))}
      {extra > 0 && (
        <div
          className={`flex items-center justify-center rounded-full bg-ink-500 text-white ring-2 ring-white font-semibold ${
            size === "xs" ? "w-6 h-6 text-[10px]" : size === "md" ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs"
          }`}
        >
          +{extra}
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;
