"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [userId, setUserId] = useState(""); // Changed from username to userId
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error state

    try {
      const response = await fetch(`/api/user?userId=${userId}`); // Fetch user by userId
      if (!response.ok) {
        setError("Invalid credentials. Please try again.");
        return;
      }

      const user = await response.json();
      if (user.password !== password) {
        setError("Incorrect password.");
        return;
      }

      console.log("Login successful:", user);
      router.push("/home"); // Redirect to home page

    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="h-screen overflow-hidden flex relative">
      {/* Left Section - Image & Demo Text */}
      <div className="w-[40%] flex flex-col items-center justify-center px-10 text-center">
        <Image
          src="/images/login.png"
          width={300}
          height={300}
          alt="Demo"
          className="mb-5"
        />
        <h1 className="text-3xl font-bold text-gray-700">Welcome Back!</h1>
        <p className="text-gray-500 mt-2">
          Experience the best platform for managing your tasks efficiently.
        </p>
      </div>

      {/* Curved Background with Login Form */}
      <div
        className="w-[60%] h-full flex items-center justify-center bg-gray-300 shadow-lg"
        style={{
          clipPath: "ellipse(100% 120% at 100% 50%)",
        }}
      >
        {/* Form Section */}
        <div className="w-[70%] p-10">
          <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center">
            Login
          </h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Enter User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-3 border rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Enter Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
