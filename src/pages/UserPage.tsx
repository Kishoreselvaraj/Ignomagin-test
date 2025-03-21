"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { EyeIcon, EyeOffIcon, ArrowLeft } from "lucide-react"; // Added ArrowLeft icon

export default function UserPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("operator");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const edit = searchParams?.get("edit");
    if (edit === "true") {
      setIsEditing(true);
      setEditId(searchParams!.get("id") || "");
      setUsername(searchParams!.get("username") || "");
      setUserId(searchParams!.get("userId") || "");
      setRole(searchParams!.get("role") || "");

      // Fetch the actual password when editing
      fetch(`/api/user?id=${searchParams!.get("id")}`)
        .then((res) => res.json())
        .then((data) => {
          setPassword(data.password);
        })
        .catch((error) => console.error("Failed to fetch password", error));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!isEditing && password !== confirmPassword) {
      setMessage("Passwords do not match!");
      setLoading(false);
      return;
    }

    const userData = {
      username,
      userId,
      role,
      password: password,
    };

    try {
      const response = await fetch(
        `/api/user${isEditing ? `?id=${editId}` : ""}`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        throw new Error(
          isEditing ? "Failed to update user" : "Failed to create user"
        );
      }

      setUsername("");
      setUserId("");
      setPassword("");
      setConfirmPassword("");
      setRole("operator");
      setMessage(
        isEditing ? "User updated successfully!" : "User created successfully!"
      );

      setTimeout(() => {
        router.push("/user");
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      setMessage(isEditing ? "Failed to update user" : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar />

      {/* Back arrow button */}
      <div className="p-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      <div className="p-6 w-[80%] h-full m-16 font-poppins">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? "Edit User" : "Create New User"}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-gray-700 font-bold">Name</label>
              <input
                type="text"
                value={username}
                placeholder="Enter your name"
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold">User ID</label>
              <input
                type="text"
                value={userId}
                placeholder="Enter your user ID"
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-200"
                required
              />
            </div>
          </div>

          <br />

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-gray-700 font-bold">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-200 pr-10"
                required={!isEditing}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 transform -translate-y-1/2"
              >
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>

            {!isEditing && (
              <div className="relative">
                <label className="block text-gray-700 font-bold">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  placeholder="Confirm your password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border rounded-md bg-gray-200 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-10 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
            )}
          </div>

          <br />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-200"
                required
              >
                <option value="operator">Operator</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            {/* Submit button with orange color */}
            <button
              type="submit"
              className={`px-4 py-2 font-bold rounded-md ${
                loading ? "bg-gray-500" : "bg-[#ea580c] hover:bg-[#d64d0a]"
              } text-white`}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEditing
                ? "Update User"
                : "Create User"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/user")}
              className="px-4 py-2 font-bold rounded-md bg-gray-500 hover:bg-gray-600 text-white"
            >
              Cancel
            </button>
          </div>

          {message && (
            <p
              className={`mt-4 text-lg font-bold ${
                message.includes("successfully")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
      <Footer />
    </div>
  );
}
