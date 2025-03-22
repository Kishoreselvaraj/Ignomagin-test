"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

interface Task {
  id: string;
  taskName: string;
  productId: string;
  part: string;
  pos1: string;
  pos2: string;
  posUnit: string;
  speed: string;
  speedUnit: string;
  cycleCount: string;
  totalCycleCount: string;
  runTime: string;
  totalRunTime: string;
  restTime: string;
  motionType: string;
  testMethod: string;
}

function TaskEdit() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      const id = searchParams?.get("id");
      if (!id) {
        console.error("No task ID provided in the URL.");
        setMessage("Failed to load task: No task ID provided.");
        return;
      }
  
      try {
        setLoading(true);
        const res = await fetch(`/api/task?id=${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch task");
        }
        const data = await res.json();
        setTask(data);
        console.log("Task data fetched successfully:", data);
      } catch (error) {
        console.error("Error fetching task:", error);
        setMessage("Failed to load task.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchTask();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!task) return;

    const updatedTask = {
      ...task,
      taskName: e.currentTarget.taskName.value,
      productId: e.currentTarget.productId.value,
      part: e.currentTarget.part.value,
      pos1: e.currentTarget.pos1.value,
      pos2: e.currentTarget.pos2.value,
      posUnit: e.currentTarget.posUnit.value,
      speed: e.currentTarget.speed.value,
      speedUnit: e.currentTarget.speedUnit.value,
      cycleCount: e.currentTarget.cycleCount.value,
      totalCycleCount: e.currentTarget.totalCycleCount.value,
      runTime: e.currentTarget.runTime.value,
      totalRunTime: e.currentTarget.totalRunTime.value,
      restTime: e.currentTarget.restTime.value,
      motionType: e.currentTarget.motionType.value,
      testMethod: e.currentTarget.testMethod.value,
    };

    try {
      setLoading(true);
      const response = await fetch(`/api/task?id=${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setMessage("Task updated successfully!");
      setTimeout(() => {
        router.push("/tasks");
      }, 1500);
    } catch (error) {
      console.error("Error updating task:", error);
      setMessage("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="p-6 w-[80%] h-full m-16 font-poppins">
        <button
          onClick={() => router.push("/tasks")}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <h1 className="text-2xl font-bold mb-6">Edit Task</h1>

        {loading ? (
          <div className="text-center p-4 mt-4 bg-blue-50 rounded-md">
            <p className="text-blue-800">Loading task...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Task Name
                </label>
                <input
                  type="text"
                  name="taskName"
                  defaultValue={task?.taskName || ""}
                  placeholder="Enter Task Name"
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Product ID
                </label>
                <input
                  type="text"
                  name="productId"
                  defaultValue={task?.productId || ""}
                  placeholder="Enter Product ID"
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Part
                </label>
                <input
                  type="text"
                  name="part"
                  defaultValue={task?.part || ""}
                  placeholder="Enter Part"
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Position 1
                </label>
                <input
                  type="number"
                  name="pos1"
                  defaultValue={task?.pos1 || ""}
                  placeholder="Enter Position 1"
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Position 2
                </label>
                <input
                  type="number"
                  name="pos2"
                  defaultValue={task?.pos2 || ""}
                  placeholder="Enter Position 2"
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Position Unit
                </label>
                <select
                  name="posUnit"
                  defaultValue={task?.posUnit || "MM"}
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                >
                  <option value="MM">MM</option>
                  <option value="CM">CM</option>
                  <option value="M">M</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Speed
                </label>
                <input
                  type="number"
                  name="speed"
                  defaultValue={task?.speed || ""}
                  placeholder="Enter Speed"
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Speed Unit
                </label>
                <select
                  name="speedUnit"
                  defaultValue={task?.speedUnit || "MS"}
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                >
                  <option value="MS">MS</option>
                  <option value="KMH">KMH</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Cycle Count
                </label>
                <input
                  type="number"
                  name="cycleCount"
                  defaultValue={task?.cycleCount || ""}
                  placeholder="Enter Cycle Count"
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Run Time (hr)
                </label>
                <input
                  type="number"
                  name="runTime"
                  defaultValue={task?.runTime || ""}
                  placeholder="Enter Run Time"
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Total Cycles
                </label>
                <input
                  type="number"
                  name="totalCycleCount"
                  defaultValue={task?.totalCycleCount || ""}
                  placeholder="Enter Total Cycle Count"
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Total Run Time (hr)
                </label>
                <input
                  type="number"
                  name="totalRunTime"
                  defaultValue={task?.totalRunTime || ""}
                  placeholder="Enter Total Run Time"
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Rest Time (min)
                </label>
                <input
                  type="number"
                  name="restTime"
                  defaultValue={task?.restTime || ""}
                  placeholder="Enter Rest Time"
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Motion Type
                </label>
                <select
                  name="motionType"
                  defaultValue={task?.motionType || "LINEAR"}
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                >
                  <option value="LINEAR">Linear</option>
                  <option value="ROTARY">Rotary</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Test Method
                </label>
                <select
                  name="testMethod"
                  defaultValue={task?.testMethod || "standard"}
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                >
                  <option value="standard">Standard</option>
                  <option value="custom">Custom</option>
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
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/tasks")}
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
        )}
      </div>
      <Footer />
    </div>
  );
}

export default TaskEdit;