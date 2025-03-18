"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";

// Define user type
interface User {
  id: string;
  userId: string;
  createdAt: string;
  username: string;
  role: string;
}

const UserTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<string>(""); // Initialize as empty string
  const [filterRole, setFilterRole] = useState<string>("operator");
  const router = useRouter();

  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("userRole") || "";
      setRole(storedRole);
    }
  }, []);
  console.log(setRole,setFilterRole)
  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/user");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data: User[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  // Function to delete user
  const deleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`/api/user?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Function to handle editing
  const handleEdit = (user: User) => {
    router.push(
      `/userCreate?edit=true&id=${user.id}&username=${user.username}&userId=${user.userId}&role=${user.role}`
    );
  };

  // Filter users by role
  const filteredUsers = users.filter((user) =>
    user.role.trim().toLowerCase() === filterRole.toLowerCase()
  );

  return (
    <div>
      <NavBar />
      <div className="p-6">
        <div className="min-h-[350px] max-h-[350px] overflow-y-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg border">
            <thead className="bg-[#588C91] text-white h-12">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">User Name</th>
                <th className="p-3">User ID</th>
                <th className="p-3">Role</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t text-center hover:bg-gray-100">
                  <td className="p-3">
                    {new Date(user.createdAt).toISOString().split("T")[0]}
                  </td>
                  <td className="p-3">{user.username}</td>
                  <td className="p-3">{user.userId}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3 text-blue-500">
                    <button className="mr-4 text-orange-500" onClick={() => handleEdit(user)}>
                      Edit
                    </button>
                    <button className="text-red-500" onClick={() => deleteUser(user.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={() => router.push("/userCreate")}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
          >
            Create User
          </button>
          <button className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md cursor-not-allowed">
            Print
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserTable;
