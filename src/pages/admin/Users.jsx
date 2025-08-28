import React, { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";

function RoleBadge({ role }) {
  const base = "px-2 py-0.5 rounded text-xs font-medium capitalize";
  const styles =
    role === "admin"
      ? "bg-purple-100 text-purple-800"
      : role === "tutor"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800"; // student
  return <span className={`${base} ${styles}`}>{role}</span>;
}

function ActiveBadge({ active }) {
  return active ? (
    <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
      Active
    </span>
  ) : (
    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
      Inactive
    </span>
  );
}

export default function AdminUsers() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (role) params.append("role", role);
      if (active) params.append("active", active);
      const data = await api("/api/admin/users?" + params.toString(), { token });
      setList(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function update(id, patch) {
    await api("/api/admin/users/" + id, { method: "PUT", token, body: patch });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin · Users</h1>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Search name/email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Any role</option>
          <option value="student">Student</option>
          <option value="tutor">Tutor</option>
          <option value="admin">Admin</option>
        </select>
        <select
          className="border p-2 rounded"
          value={active}
          onChange={(e) => setActive(e.target.value)}
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
          onClick={load}
        >
          Apply
        </button>
      </div>

      {/* User list */}
      {loading ? (
        <div className="text-gray-600">Loading users…</div>
      ) : list.length === 0 ? (
        <div className="p-4 rounded bg-gray-50 text-gray-600">No users found.</div>
      ) : (
        <div className="grid gap-3">
          {list.map((u) => (
            <div
              key={u._id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
            >
              {/* Left: user info */}
              <div>
                <div className="font-semibold text-lg">
                  {u.name || "Unnamed"}{" "}
                  <span className="text-sm text-gray-500">({u.email})</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <RoleBadge role={u.role} />
                  <ActiveBadge active={u.active} />
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                  onClick={() => update(u._id, { active: !u.active })}
                >
                  {u.active ? "Deactivate" : "Activate"}
                </button>
                <select
                  className="border p-1 rounded text-sm"
                  value={u.role}
                  onChange={(e) => update(u._id, { role: e.target.value })}
                >
                  <option value="student">student</option>
                  <option value="tutor">tutor</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
