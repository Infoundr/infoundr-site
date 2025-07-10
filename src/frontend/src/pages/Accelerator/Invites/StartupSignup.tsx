import React, { useState } from "react";
import { Link } from "react-router-dom";

const StartupSignup: React.FC = () => {
  const [form, setForm] = useState({
    startupName: "",
    founderName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted:", form);
    // TODO: Add form validation and backend call
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6 text-center">
        <h1 className="text-purple-600 font-bold text-xl mb-2">InFoundr</h1>
        <p className="text-gray-800 font-semibold mb-1">
          You’ve been invited to join InFoundr by <span className="text-purple-600">YCombinator</span>
        </p>
        <p className="text-sm text-gray-500 mb-4">Complete your profile to get started</p>

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

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              className="w-full border px-3 py-2 rounded-md"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              className="w-full border px-3 py-2 rounded-md"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="agreed"
              className="mt-1"
              checked={form.agreed}
              onChange={handleChange}
            />
            <p>
              By signing up, you agree to InFoundr’s{" "}
              <a href="#" className="text-purple-600 underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-purple-600 underline">
                Privacy Policy
              </a>
            </p>
          </div>

          <div className="bg-purple-50 text-xs p-3 rounded-md text-gray-700">
            <p>
              By signing up, you agree to be visible to your accelerator. They will have access to monitor your startup’s progress and metrics on the platform.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
          >
            Join InFoundr
          </button>
        </form>

        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 underline">
            Log in
          </Link>
        </p>
        <p className="text-xs mt-1 text-gray-500">
          Need help?{" "}
          <a href="#" className="text-purple-600 underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};

export default StartupSignup;
