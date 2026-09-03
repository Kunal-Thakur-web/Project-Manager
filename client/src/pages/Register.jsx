import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiUser, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import logo from "/logo.png";

const Register = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.username.trim()) next.username = "Username is required";
    else if (form.username.trim().length < 3) next.username = "At least 3 characters";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email";
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 6) next.password = "At least 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(form);
      toast.success("Account created! You can now log in.");
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create account"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-app-bg">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 text-white relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute -left-16 bottom-0 w-72 h-72 rounded-full bg-white/10" />

        <img src={logo} alt="Project Manager" className="h-10 w-auto brightness-0 invert relative" />

        <div className="relative">
          <h1 className="text-3xl font-bold leading-tight max-w-md">
            Bring every project, task and teammate into one clear view.
          </h1>
          <p className="text-white/80 mt-4 max-w-sm">
            Create your account to start organizing projects and assigning
            work in minutes.
          </p>
        </div>

        <p className="text-xs text-white/60 relative">
          &copy; {new Date().getFullYear()} Project Manager. All rights reserved.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <img src={logo} alt="Project Manager" className="h-9 w-auto lg:hidden mb-8" />

          <h2 className="text-2xl font-bold text-ink-900">Create your account</h2>
          <p className="text-ink-500 mt-1.5 text-sm">
            Set up a workspace for your team in seconds.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-700 mb-1.5 block">
                Full name <span className="text-ink-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={16} />
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  placeholder="Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border focus:border-brand-400 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-ink-700 mb-1.5 block">Username</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={16} />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  placeholder="janedoe"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border text-sm outline-none transition-colors ${
                    errors.username ? "border-status-todo" : "border-border focus:border-brand-400"
                  }`}
                />
              </div>
              {errors.username && <p className="text-xs text-status-todo mt-1.5">{errors.username}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-ink-700 mb-1.5 block">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={16} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@company.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border text-sm outline-none transition-colors ${
                    errors.email ? "border-status-todo" : "border-border focus:border-brand-400"
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-status-todo mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-ink-700 mb-1.5 block">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={16} />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border text-sm outline-none transition-colors ${
                    errors.password ? "border-status-todo" : "border-border focus:border-brand-400"
                  }`}
                />
              </div>
              {errors.password && <p className="text-xs text-status-todo mt-1.5">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium text-sm py-2.5 rounded-xl transition-colors mt-2"
            >
              {submitting ? "Creating account..." : "Create account"}
              {!submitting && <FiArrowRight size={16} />}
            </button>
          </form>

          <p className="text-sm text-ink-500 mt-6 text-center">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-brand-500 hover:text-brand-600">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
