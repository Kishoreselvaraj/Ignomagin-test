"use client";
import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function TaskForm() {
  const [taskName, setTaskName] = useState("");
  const [pos1, setPos1] = useState("");
  const [pos2, setPos2] = useState("");
  const [speed, setSpeed] = useState("");
  const [cycleCount, setCycleCount] = useState("");
  const [runTime, setRunTime] = useState("");
  const [motion, setMotion] = useState("");
  const [part, setPart] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const taskData = {
      taskName,
      pos1,
      pos2,
      speed,
      cycleCount,
      runTime,
      motion,
      part,
    };

    try {
      const response = await fetch("/api/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      const textResponse = await response.text();
      console.log("Raw API Response:", textResponse);

      if (!response.ok) {
        throw new Error(`API Error: ${textResponse}`);
      }

      const jsonResponse = JSON.parse(textResponse);
      console.log("Parsed JSON Response:", jsonResponse);

      alert("Task added successfully!");

      // Reset form fields
      setTaskName("");
      setPos1("");
      setPos2("");
      setSpeed("");
      setCycleCount("");
      setRunTime("");
      setMotion("");
      setPart("");

      setMessage("Task submitted successfully!");
    } catch (error) {
      console.error("Fetch Error:", error);
      setMessage("Failed to submit task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="p-6 w-[80%] h-full m-16 font-poppins">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-gray-700 font-bold">Task Name</label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold">Motion</label>
              <select
                value={motion}
                onChange={(e) => setMotion(e.target.value)}
                className="w-full border rounded-md p-2"
                required
              >
                <option value="">Select Motion</option>
                <option value="Linear">Linear</option>
                <option value="Rotary">Rotary</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-bold">Part</label>
              <select
                value={part}
                onChange={(e) => setPart(e.target.value)}
                className="w-full border rounded-md p-2"
                required
              >
                <option value="">Select Part</option>
                <option value="Joint 1">Joint 1</option>
                <option value="Joint 2">Joint 2</option>
                <option value="Joint 3">Joint 3</option>
              </select>
            </div>
          </div>

          <br />

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center">
              <label className="text-gray-700 font-bold w-32">
                Enter Pos 1
              </label>
              <input
                type="number"
                value={pos1}
                onChange={(e) => setPos1(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-200"
                required
              />
            </div>
            <div className="flex items-center">
              <label className="text-gray-700 font-bold w-32">
                Enter Pos 2
              </label>
              <input
                type="number"
                value={pos2}
                onChange={(e) => setPos2(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-200"
                required
              />
            </div>
          </div>

          <br />

          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center">
              <label className="text-gray-700 font-bold w-32">Speed</label>
              <input
                type="number"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-200"
                required
              />
            </div>
            <div className="flex items-center">
              <label className="text-gray-700 font-bold w-32">Unit</label>
              <select className="w-[50%] border rounded-md p-2">
                <option>M/S</option>
                <option>MM/s</option>
                <option>Degree/s</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="text-gray-700 font-bold w-48">
                Cycle Count
              </label>
              <input
                type="number"
                value={cycleCount}
                onChange={(e) => setCycleCount(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-200"
                required
              />
            </div>
          </div>

          <br />

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex items-center">
              <label className="text-gray-700 font-bold w-32">Run Time</label>
              <input
                type="number"
                value={runTime}
                onChange={(e) => setRunTime(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-200"
                required
              />
            </div>
            <span className="text-gray-700 mt-2 font-bold">Hours</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`mt-6 px-4 py-2 font-bold rounded-md ${
              loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Task"}
          </button>

          {/* Status Message */}
          {message && <p className="mt-4 text-lg font-bold">{message}</p>}
        </form>
      </div>
      <Footer />
    </div>
  );
}
