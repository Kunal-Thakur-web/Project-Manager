import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import logo from "/logo.png";

const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email";
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not log in"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-app-bg">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 text-white relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute -left-16 bottom-0 w-72 h-72 rounded-full bg-white/10" />

        <img
          src={logo}
          alt="Project Manager"
          className="h-15 w-15 relative"
        />

        <div className="relative">
          <h1 className="text-3xl font-bold leading-tight max-w-md">
            Plan, track and deliver every project in one place.
          </h1>
          <p className="text-white/80 mt-4 max-w-sm">
            Keep your teams aligned with shared projects, live task boards,
            and a dashboard that shows exactly where things stand.
          </p>
        </div>

        <p className="text-xs text-white/60 relative">
          &copy; {new Date().getFullYear()} Project Manager. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <img src={logo} alt="Project Manager" className="h-9 w-auto lg:hidden mb-8" />

          <h2 className="text-2xl font-bold text-ink-900">Welcome back</h2>
          <p className="text-ink-500 mt-1.5 text-sm">
            Log in to continue to your workspace.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-700 mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={16} />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@company.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border text-sm outline-none transition-colors ${
                    errors.email
                      ? "border-status-todo"
                      : "border-border focus:border-brand-400"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-status-todo mt-1.5">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-ink-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-500 hover:text-brand-600"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-card border text-sm outline-none transition-colors ${
                    errors.password
                      ? "border-status-todo"
                      : "border-border focus:border-brand-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-status-todo mt-1.5">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium text-sm py-2.5 rounded-xl transition-colors mt-2"
            >
              {submitting ? "Logging in..." : "Log in"}
              {!submitting && <FiArrowRight size={16} />}
            </button>
          </form>

          <p className="text-sm text-ink-500 mt-6 text-center">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-brand-500 hover:text-brand-600">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
