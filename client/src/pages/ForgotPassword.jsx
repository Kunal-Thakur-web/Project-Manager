import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { authApi } from "../api/auth.api";
import { getErrorMessage } from "../utils/getErrorMessage";
import logo from "/logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err, "Could not send reset email"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg p-6">
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border p-8">
        <img src={logo} alt="Project Manager" className="h-9 w-auto mb-6" />

        {sent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-2xl bg-status-done-bg text-status-done flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle size={22} />
            </div>
            <h2 className="text-lg font-bold text-ink-900">Check your inbox</h2>
            <p className="text-sm text-ink-500 mt-1.5">
              If an account exists for {email}, a reset link is on its way.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-ink-900">Reset your password</h2>
            <p className="text-ink-500 mt-1.5 text-sm">
              Enter your email and we'll send you a link to reset it.
            </p>

            <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-ink-700 mb-1.5 block">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@company.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-app-bg border text-sm outline-none transition-colors ${
                      error ? "border-status-todo" : "border-border focus:border-brand-400"
                    }`}
                  />
                </div>
                {error && <p className="text-xs text-status-todo mt-1.5">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium text-sm py-2.5 rounded-xl transition-colors"
              >
                {submitting ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        )}

        <Link
          to="/login"
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-600 mt-6"
        >
          <FiArrowLeft size={14} /> Back to log in
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
