"use client";
import React, { useState, useEffect } from "react";
import { PlayIcon, PauseIcon, StopIcon } from "@heroicons/react/24/solid";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

interface Task {
  taskName: string;
  createdAt?: string;
  cycleCount?: string;
  part?: string;
  etc?: string;
}

function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [remainingETC, setRemainingETC] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/task");
        const data = await res.json();

        const updatedTasks = data
          .map((task: Task) => ({
            ...task,
            etc: `${Math.floor(Math.random() * 10) + 1} hrs`, // Assign a random ETC (1-10 hrs)
          }))
          .sort(
            (a: Task, b: Task) =>
              new Date(b.createdAt || "").getTime() -
              new Date(a.createdAt || "").getTime()
          ); // Sort by latest createdAt

        console.log("Sorted Tasks:", updatedTasks);
        setTasks(updatedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && selectedTask?.cycleCount) {
      const maxCycle = parseInt(selectedTask.cycleCount, 10);
      if (currentCycle < maxCycle) {
        interval = setInterval(() => {
          setCurrentCycle((prevCycle) => {
            if (prevCycle + 1 >= maxCycle) {
              setIsRunning(false); // Stop when reaching max cycles
              return maxCycle;
            }
            return prevCycle + 1;
          });
        }, 1000);
      } else {
        setIsRunning(false);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentCycle, selectedTask]);

  useEffect(() => {
    if (selectedTask) {
      const maxCycle = parseInt(selectedTask.cycleCount || "1", 10);
      const initialETC = parseInt(selectedTask.etc?.split(" ")[0] || "0", 10); // Extract numeric part from "X hrs"
      setRemainingETC(initialETC);

      if (currentCycle > 0 && maxCycle > 0) {
        const etcPerCycle = initialETC / maxCycle;
        const newETC = Math.max(0, initialETC - currentCycle * etcPerCycle);
        setRemainingETC(newETC);
      }
    }
  }, [currentCycle, selectedTask]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setCurrentCycle(0);
    setIsRunning(false);

    const initialETC = parseInt(task.etc?.split(" ")[0] || "0", 10);
    setRemainingETC(initialETC);
  };

  return (
    <div>
      <NavBar />
      <div className="p-8 h-screen font-poppins">
        <h1 className="text-2xl font-bold mb-4 text-[#DA7534] flex justify-center">
          Current Task
        </h1>

        {/* Dashboard Fields */}
        <div className="grid grid-cols-3 gap-6 p-4">
          {/* First Column */}
          <div className="border p-4 rounded-lg space-y-3">
            <div className="flex items-center">
              <label className="w-24 font-bold text-[#DA7534]">
                Task Name:
              </label>
              <div className="p-2 bg-gray-100 rounded-md text-gray-800 flex-grow">
                {selectedTask?.taskName || "Select a task"}
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-24 font-bold text-[#DA7534]">
                Start Date:
              </label>
              <div className="p-2 bg-gray-100 rounded-md text-gray-800 flex-grow">
                {selectedTask?.createdAt
                  ? new Date(selectedTask.createdAt).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
          </div>

          {/* Second Column (Buttons) */}
          <div className="border p-4 rounded-lg flex justify-center items-center">
            <div className="flex gap-4">
              <button
                className="flex items-center justify-center bg-[#588C91] text-white p-3 rounded-full hover:bg-blue-600"
                onClick={() => setIsRunning(true)}
                disabled={isRunning}
              >
                <PlayIcon className="h-6 w-6" />
              </button>
              <button
                className="flex items-center justify-center bg-[#588C91] text-white p-3 rounded-full hover:bg-yellow-600"
                onClick={() => setIsRunning(false)}
              >
                <PauseIcon className="h-6 w-6" />
              </button>
              <button
                className="flex items-center justify-center bg-[#588C91] text-white p-3 rounded-full hover:bg-red-600"
                onClick={() => {
                  setIsRunning(false);
                  setCurrentCycle(0);
                  setRemainingETC(
                    parseInt(selectedTask?.etc?.split(" ")[0] || "0", 10)
                  );
                }}
              >
                <StopIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Third Column */}
          <div className="border p-4 rounded-lg space-y-3">
            <div className="flex items-center">
              <label className="w-24 font-bold text-[#DA7534]">Part:</label>
              <div className="p-2 bg-gray-100 rounded-md text-gray-800 flex-grow">
                {selectedTask?.part || "N/A"}
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-24 font-bold text-[#DA7534]">ETC:</label>
              <div className="p-2 bg-gray-100 rounded-md text-gray-800 flex-grow">
                {remainingETC.toFixed(2)} hrs
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-24 font-bold text-[#DA7534]">Cycle:</label>
              <div className="p-2 bg-gray-100 rounded-md text-gray-800 flex-grow">
                {`${currentCycle}/${selectedTask?.cycleCount || "N/A"}`}
              </div>
            </div>
          </div>
        </div>

        {/* Task Table */}
        <div className="overflow-x-auto mt-6">
          <div className="max-h-[350px] overflow-y-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg border">
              <thead className="sticky top-0 bg-[#588C91] text-gray-100 h-20">
                <tr>
                  <th className="p-2 text-left">S.no</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Task Name</th>
                  <th className="p-2 text-left">ETC</th>
                  <th className="p-2 text-left">Cycle Count</th>
                  <th className="p-2 text-left">Part</th>
                  <th className="p-2 text-left">Report</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr
                    key={index}
                    className="border-t cursor-pointer hover:bg-gray-100"
                    onClick={() => handleTaskClick(task)}
                  >
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">
                      {new Date(task.createdAt || "").toLocaleDateString()}
                    </td>
                    <td className="p-2">{task.taskName}</td>
                    <td className="p-2">{task.etc}</td>
                    <td className="p-2">{task.cycleCount}</td>
                    <td className="p-2">{task.part}</td>
                    <td className="p-2">
                      <button className="bg-[#F9594C] text-white px-4 py-1 rounded-md hover:bg-[#F79251]">
                        Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Absolute Buttons in Bottom Right */}
        <div className="fixed bottom-24 right-5 flex gap-4">
          <button className="bg-[#588C91] text-white px-10 py-4 rounded-md hover:bg-blue-600">
            Run Task
          </button>
          <button className="bg-[#DA7534] text-white px-10 py-4 rounded-md hover:bg-orange-600">
            Report
          </button>
          <button className="bg-[#F9594C] text-white px-10 py-4 rounded-md hover:bg-red-600">
            Download
          </button>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default HomePage;
