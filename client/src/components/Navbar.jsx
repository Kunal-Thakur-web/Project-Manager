import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiBell, FiChevronDown, FiLogOut } from "react-icons/fi";
import logo from "/logo.png";
import { useAuth } from "../context/AuthContext";
import Avatar from "./ui/Avatar";
import SearchBar from "./SearchBar";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/projects", label: "Projects" },
  { to: "/my-tasks", label: "My tasks" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6 px-6 h-16">
        <div className="flex items-center gap-8">
          <img src={logo} alt="Project Manager" className="h-9 w-auto" />
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `text-sm font-medium pb-1 border-b-2 transition-colors ${
                    isActive
                      ? "text-brand-600 border-brand-500"
                      : "text-ink-500 border-transparent hover:text-ink-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <SearchBar />

          <button
            aria-label="Notifications"
            className="relative p-2 rounded-full text-ink-500 hover:bg-app-bg transition-colors"
          >
            <FiBell size={19} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-app-bg transition-colors"
            >
              <Avatar user={user} size="sm" />
              <span className="hidden sm:block text-sm font-medium text-ink-700 max-w-[110px] truncate">
                {user?.fullName || user?.username}
              </span>
              <FiChevronDown size={14} className="text-ink-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-xl border border-border overflow-hidden animate-[fadeIn_0.12s_ease-out]">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-ink-900 truncate">
                    {user?.fullName || user?.username}
                  </p>
                  <p className="text-xs text-ink-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-status-todo hover:bg-app-bg transition-colors"
                >
                  <FiLogOut size={15} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
