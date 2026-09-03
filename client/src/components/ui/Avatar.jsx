import { useState } from "react";

const PALETTE = [
  "#2F6FED",
  "#F5A623",
  "#22C37E",
  "#F45B69",
  "#7C5CF0",
  "#00A8B5",
];

const colorFor = (seed = "") => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const SIZES = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
};

const Avatar = ({ user, size = "sm", className = "", ring = true }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const name = user?.fullName || user?.username || user?.email || "?";
  const url = user?.avatar?.url;
  const sizeClass = SIZES[size] || SIZES.sm;

  return (
    <div
      title={name}
      className={`relative shrink-0 rounded-full overflow-hidden flex items-center justify-center font-semibold text-white select-none ${sizeClass} ${
        ring ? "ring-2 ring-white" : ""
      } ${className}`}
      style={{ backgroundColor: colorFor(name) }}
    >
      {url && !imgFailed ? (
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;
