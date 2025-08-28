import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { token, user, setUser } = useAuth();

  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState("");
  const [maxPricePerHour, setMaxPrice] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [timezone, setTimezone] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [preferredLanguages, setPreferredLanguages] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [dob, setDob] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    try {
      const me = await api('/api/student/profile', { token });
      setUser(me);
    } catch {}
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setSubjects((user.preferences?.subjects || []).join(", "));
      setMaxPrice(user.preferences?.maxPricePerHour || "");

      const sp = user.studentProfile || {};
      setAvatarUrl(sp.avatarUrl || "");
      setPhone(sp.phone || "");
      setBio(sp.bio || "");
      setGradeLevel(sp.gradeLevel || "");
      setTimezone(sp.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "");
      setLearningGoals(sp.learningGoals || "");
      setPreferredLanguages((sp.preferredLanguages || []).join(", "));
      setCity(sp.address?.city || "");
      setCountry(sp.address?.country || "");
      setDob(sp.dateOfBirth ? new Date(sp.dateOfBirth).toISOString().slice(0,10) : "");
      setEmailNotifications(sp.communicationPreferences?.emailNotifications ?? true);
    }
  }, [user]);

  async function uploadAvatarIfNeeded() {
    if (!avatarFile) return avatarUrl;
    const key = `avatars/${user.id || user._id}/${Date.now()}-${avatarFile.name}`;
    const { url } = await api('/api/storage/presign', { method: 'POST', token, body: { key, contentType: avatarFile.type || 'application/octet-stream' } });
    await fetch(url, { method: 'PUT', headers: { 'Content-Type': avatarFile.type || 'application/octet-stream' }, body: avatarFile });
    const publicBase = (import.meta.env.VITE_S3_PUBLIC_BASE || '').replace(/\/$/, '');
    return publicBase ? `${publicBase}/${key}` : key;
  }

  async function save() {
    setSaving(true); setErr(""); setMsg("");
    try {
      const avatar = await uploadAvatarIfNeeded();

      const payload = {
        name,
        preferences: {
          subjects: subjects.split(",").map(s=>s.trim()).filter(Boolean),
          maxPricePerHour: Number(maxPricePerHour) || null,
        },
        studentProfile: {
          avatarUrl: avatar || avatarUrl,
          phone,
          bio,
          gradeLevel,
          timezone,
          learningGoals,
          preferredLanguages: preferredLanguages.split(",").map(s=>s.trim()).filter(Boolean),
          communicationPreferences: { emailNotifications: !!emailNotifications },
          address: { city, country },
          dateOfBirth: dob ? new Date(dob) : null
        }
      };

      const updated = await api("/api/student/profile", { method: "PUT", token, body: payload });
      setUser(updated);
      setAvatarFile(null);
      setMsg("Profile saved!");
      setTimeout(()=>setMsg(""), 2000);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      {err && <div className="mb-3 text-red-600">{err}</div>}
      {msg && <div className="mb-3 text-green-600">{msg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-3">
            { (avatarFile || avatarUrl) ? (
              <img
                src={avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No photo</div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={e=>setAvatarFile(e.target.files?.[0] || null)} />
        </div>

        <div className="md:col-span-2">
          <label className="block font-medium">Name</label>
          <input className="w-full border rounded p-2 mb-3" value={name} onChange={e=>setName(e.target.value)} />

          <label className="block font-medium">Preferred subjects (comma separated)</label>
          <input className="w-full border rounded p-2 mb-3" value={subjects} onChange={e=>setSubjects(e.target.value)} />

          <label className="block font-medium">Max price per hour (₹)</label>
          <input className="w-full border rounded p-2 mb-3" value={maxPricePerHour} onChange={e=>setMaxPrice(e.target.value)} />

          <label className="block font-medium">Bio</label>
          <textarea className="w-full border rounded p-2 mb-3" rows="4" value={bio} onChange={e=>setBio(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block font-medium">Phone</label>
          <input className="w-full border rounded p-2" value={phone} onChange={e=>setPhone(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium">Grade level</label>
          <input className="w-full border rounded p-2" value={gradeLevel} onChange={e=>setGradeLevel(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium">Timezone</label>
          <input className="w-full border rounded p-2" value={timezone} onChange={e=>setTimezone(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium">Learning goals</label>
          <input className="w-full border rounded p-2" value={learningGoals} onChange={e=>setLearningGoals(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium">Preferred languages (comma separated)</label>
          <input className="w-full border rounded p-2" value={preferredLanguages} onChange={e=>setPreferredLanguages(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium">Date of birth</label>
          <input type="date" className="w-full border rounded p-2" value={dob} onChange={e=>setDob(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium">City</label>
          <input className="w-full border rounded p-2" value={city} onChange={e=>setCity(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium">Country</label>
          <input className="w-full border rounded p-2" value={country} onChange={e=>setCountry(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input id="emailNoti" type="checkbox" checked={emailNotifications} onChange={e=>setEmailNotifications(e.target.checked)} />
          <label htmlFor="emailNoti" className="font-medium">Email notifications</label>
        </div>
      </div>

      <div className="mt-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}