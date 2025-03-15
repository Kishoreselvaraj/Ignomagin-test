"use client";
import { Suspense } from "react";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

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

  useEffect(() => {
    // Check if we're in edit mode
    const edit = searchParams?.get("edit");
    if (edit === "true") {
      setIsEditing(true);
      setEditId(searchParams!.get("id") || "");
      setUsername(searchParams!.get("username") || "");
      setUserId(searchParams!.get("userId") || "");
      setRole(searchParams!.get("role") || "");
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

    const userData = isEditing
      ? { username, userId, role }
      : { username, userId, password, role };

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

      // Reset form and redirect
      setUsername("");
      setUserId("");
      setPassword("");
      setConfirmPassword("");
      setRole("");
      setMessage(
        isEditing ? "User updated successfully!" : "User created successfully!"
      );

      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        router.push("/user");
      }, 1500);
    } catch (error) {
      setMessage(isEditing ? "Failed to update user" : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="p-6 w-[80%] h-full m-16 font-poppins">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? "Edit User" : "Create New User"}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-gray-700 font-bold">Username</label>
              <input
                type="text"
                value={username}
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
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-200"
                required
              />
            </div>
          </div>

          <br />

          {!isEditing && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded-md bg-gray-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border rounded-md bg-gray-200"
                    required
                  />
                </div>
              </div>
              <br />
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-200"
                required
              >
                <option value="Operator">Operator</option>
                {/* <option value="admin">Admin</option> */}
                {/* <option value="operator">Operator</option> */}
              </select>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className={`px-4 py-2 font-bold rounded-md ${
                loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
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
