import React, { useState } from "react";
import { useParams } from "react-router-dom";

const StartupInviteAccept: React.FC = () => {
  const { "invite-code": inviteCode } = useParams();
  const [form, setForm] = useState({
    startupName: "",
    founderName: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call backend accept_startup_invite with inviteCode and form data
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6 text-center">
        <h1 className="text-purple-600 font-bold text-xl mb-2">Accept Startup Invite</h1>
        <p className="text-gray-800 font-semibold mb-4">
          {/* Optionally show invite code or accelerator name here */}
          Invite Code: <span className="text-purple-600">{inviteCode}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm mb-1">Startup Name</label>
            <input
              type="text"
              name="startupName"
              placeholder="Your startup name"
              className="w-full border px-3 py-2 rounded-md"
              value={form.startupName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Founder Name</label>
            <input
              type="text"
              name="founderName"
              placeholder="Your full name"
              className="w-full border px-3 py-2 rounded-md"
              value={form.founderName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="w-full border px-3 py-2 rounded-md"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
          >
            Accept Invite
          </button>
        </form>
      </div>
    </div>
  );
};

export default StartupInviteAccept;
