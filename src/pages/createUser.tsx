"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function SuperUserForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState("");

  useEffect(() => {
    if (searchParams) {
      const edit = searchParams.get("edit");
      if (edit === "true") {
        setIsEditing(true);
        setEditId(searchParams.get("id") || "");
        setUsername(searchParams.get("username") || "");
        setUserId(searchParams.get("userId") || "");
        setRole(searchParams.get("role") || "");
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      setLoading(false);
      return;
    }

    const userData = {
      username,
      userId,
      password: password || undefined, // Include password only if it is set
      role,
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
      setRole("");
      setMessage(
        isEditing ? "User updated successfully!" : "User created successfully!"
      );

      setTimeout(() => {
        router.push("/superuser");
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
      <div className="p-6 w-[80%] h-full m-16 font-poppins">
        
        {/* Back Button with Arrow */}
        <button
          onClick={() => router.push("/superuser")}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

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
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Name"
                className="w-full p-2 border rounded-md bg-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold">User ID</label>
              <input
                type="text"
                value={userId}
                placeholder="Enter User ID"
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-200"
                required
              />
            </div>
          </div>

          <br />

          {/* Password Fields for Both Creating and Editing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold">Password</label>
              <input
                type="password"
                value={password}
                placeholder="Enter Password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-200"
                required={!isEditing}  // Required only when creating
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-200"
                required={!isEditing}  // Required only when creating
              />
            </div>
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
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="operator">Operator</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className={`px-4 py-2 font-bold rounded-md ${
                loading ? "bg-gray-500" : "bg-[#ea580c] hover:bg-[#d9530a]"
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
              onClick={() => router.push("/superuser")}
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

export default function SuperUserPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SuperUserForm />
    </Suspense>
  );
}
