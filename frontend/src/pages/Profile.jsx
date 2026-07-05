import { useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import PageLayout from "../components/common/PageLayout.jsx";
import Spinner from "../components/common/Spinner.jsx";
import { toast } from "../components/common/Toast.jsx";
import ToastContainer from "../components/common/Toast.jsx";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    college: user?.college || "",
    graduationYear: user?.graduationYear || "",
    targetRoles: (user?.targetRoles || []).join(", "),
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        bio: form.bio,
        college: form.college,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
        targetRoles: form.targetRoles
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
      };

      const { data } = await api.put("/users/profile", payload);
      updateUser(data.user);
      toast.success("Profile saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout>
      <ToastContainer />
      <div className="max-w-2xl mx-auto">
        {/* Avatar + name */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-3xl font-bold text-white shadow-glow">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-2xl font-bold text-white">
              {user?.stats?.totalInterviews ?? 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total interviews</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-white">
              {user?.stats?.averageScore ?? 0}
              <span className="text-sm font-normal text-gray-400"> / 100</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Average score</p>
          </div>
        </div>

        {/* Edit form */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-5">Edit profile</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Full name" id="name">
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="input-field"
              />
            </Field>

            <Field label="Bio" id="bio">
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself…"
                maxLength={300}
                className="input-field resize-none"
              />
              <p className="text-xs text-gray-600 mt-1 text-right">
                {form.bio.length}/300
              </p>
            </Field>

            <Field label="College / University" id="college">
              <input
                id="college"
                name="college"
                type="text"
                value={form.college}
                onChange={handleChange}
                placeholder="e.g. IIT Delhi"
                className="input-field"
              />
            </Field>

            <Field label="Graduation year" id="graduationYear">
              <input
                id="graduationYear"
                name="graduationYear"
                type="number"
                min={2000}
                max={2040}
                value={form.graduationYear}
                onChange={handleChange}
                placeholder="e.g. 2025"
                className="input-field"
              />
            </Field>

            <Field
              label="Target roles"
              id="targetRoles"
              hint="Comma-separated, e.g. SDE-1, Backend Engineer"
            >
              <input
                id="targetRoles"
                name="targetRoles"
                type="text"
                value={form.targetRoles}
                onChange={handleChange}
                placeholder="SDE-1, Backend Engineer"
                className="input-field"
              />
            </Field>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? <Spinner size="sm" /> : null}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}

function Field({ label, id, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}
