"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
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
  const router = useRouter();
  const params = useParams();
  const id = params ? params.id : null; // Get the id from the path
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pos1, setPos1] = useState("0");
  const [pos2, setPos2] = useState("0");

  useEffect(() => {
    const fetchTask = async () => {
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
        setPos1(data.pos1);
        setPos2(data.pos2);
      } catch (error) {
        console.error("Error fetching task:", error);
        setMessage("Failed to load task.");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handlePos1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPos1(value);
  };

  const handlePos2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPos2(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!task) return;

    const numPos1 = parseFloat(pos1);
    const numPos2 = parseFloat(pos2);

    if (isNaN(numPos1) || numPos1 < 0) {
      setMessage("Please enter a valid number for Position 1");
      return;
    }

    if (isNaN(numPos2) || numPos2 < numPos1) {
      setMessage("Position 2 must be greater than or equal to Position 1");
      return;
    }
    if(numPos2 > parseFloat(task.pos2)){
      setMessage("Position 2 must be less than or equal to the original Position 2");
      return;
    }

    const updatedTask = {
      id: task.id,
      taskName: (document.querySelector('input[name="taskName"]') as HTMLInputElement)?.value || "",
      productId: (document.querySelector('input[name="productId"]') as HTMLInputElement)?.value || "",
      part: (document.querySelector('input[name="part"]') as HTMLInputElement)?.value || "",
      pos1: numPos1,
      pos2: numPos2,
      posUnit: (document.querySelector('select[name="posUnit"]') as HTMLSelectElement)?.value || "",
      speed: parseFloat((document.querySelector('input[name="speed"]') as HTMLInputElement)?.value || "0"),
      speedUnit: (document.querySelector('select[name="speedUnit"]') as HTMLSelectElement)?.value || "",
      cycleCount: parseInt((document.querySelector('input[name="cycleCount"]') as HTMLInputElement)?.value || "0"),
      totalCycleCount: parseInt((document.querySelector('input[name="totalCycleCount"]') as HTMLInputElement)?.value || "0"),
      runTime: parseFloat((document.querySelector('input[name="runTime"]') as HTMLInputElement)?.value || "0"),
      totalRunTime: parseFloat((document.querySelector('input[name="totalRunTime"]') as HTMLInputElement)?.value || "0"),
      restTime: parseFloat((document.querySelector('input[name="restTime"]') as HTMLInputElement)?.value || "0"),
      motionType: (document.querySelector('select[name="motionType"]') as HTMLSelectElement)?.value || "",
      testMethod: (document.querySelector('select[name="testMethod"]') as HTMLSelectElement)?.value || "",
    };

    try {
      setLoading(true);
      const response = await fetch(`/api/task`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (error) {
          console.error("Failed to parse JSON from response:", error);
          errorData = { error: "Unexpected response from server" };
        }
        console.error("Error updating task:", errorData);
        setMessage(`Failed to update task: ${errorData.error || "Unknown error"}`);
        throw new Error("Failed to update task");
      }
      alert("Task updated successfully!");
      setMessage("Task updated successfully!");
      setTimeout(() => {
        router.push("/home");
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
          onClick={() => router.push("/home")}
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
                  Part
                </label>
                <input
                  type="text"
                  name="part"
                  defaultValue={task?.part || ""}
                  placeholder="Enter Part"
                  disabled
                  className="w-full p-3 border rounded-md shadow-sm bg-gray-100"
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
                  value={pos1}
                  placeholder="Enter Position 1"
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                  onChange={handlePos1Change}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Position 2
                </label>
                <input
                  type="number"
                  name="pos2"
                  value={pos2}
                  placeholder="Enter Position 2"
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                  onChange={handlePos2Change}
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
                  {task?.motionType === "LINEAR" && (
                    <>
                      <option value="MM">MM</option>
                      <option value="CM">CM</option>
                      <option value="M">M</option>
                    </>
                  )}
                  {task?.motionType === "ROTARY" && (
                    <>
                      <option value="DEG">DEG</option>
                      <option value="RAD">RAD</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Motion Type
                </label>
                <select
                  name="motionType"
                  defaultValue={task?.motionType || "LINEAR"}
                  className="w-full p-3 border rounded-md shadow-sm bg-gray-100"
                  disabled={true}
                  required
                >
                  <option value="LINEAR">Linear</option>
                  <option value="ROTARY">Rotary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-6">
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
                  {task?.motionType === "LINEAR" && (
                    <option value="MS">MS</option>
                  )}
                  {task?.motionType === "ROTARY" && (
                    <option value="DS">DS</option>
                  )}
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
                  loading ||
                  (task?.testMethod === "standard" &&
                    localStorage.getItem("userRole") !== "admin")
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#ea580c] hover:bg-[#d9530a]"
                } text-white`}
                disabled={
                  loading ||
                  (task?.testMethod === "standard" &&
                    localStorage.getItem("userRole") !== "admin")
                }
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/home")}
                className="px-4 py-2 font-bold rounded-md bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  task?.testMethod === "standard" &&
                  localStorage.getItem("userRole") !== "admin"
                }
                className={`px-4 py-2 font-bold rounded-md ${
                  task?.testMethod === "standard" &&
                  localStorage.getItem("userRole") !== "admin"
                    ? "bg-gray-400 cursor-not-allowed hidden"
                    : "bg-red-500 hover:bg-red-600"
                } text-white`}
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this task?")) {
                    try {
                      const response = await fetch(`/api/task?id=${id}`, {
                        method: "DELETE",
                      });
                      if (response.ok) {
                        router.push("/home");
                      } else {
                        console.error("Failed to delete task");
                      }
                    } catch (error) {
                      console.error("Error deleting task:", error);
                    }
                  }
                }}
              >
                <Trash2 size={18} />
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