'use client'; // Ensure this is a client component
// HomePage.tsx
import React, { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
import { PlayIcon, PauseIcon, StopIcon } from "@heroicons/react/24/solid";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

interface Task {
  id: string;
  taskName: string;
  createdAt?: string;
  cycleCount?: string;
  part?: string;
  etc?: string;
  testMethod?: string;
  pos1?: string; // Add position properties
  pos2?: string;
  totalCycle?: string;
  currentCycle?: string;
}

function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [remainingETC, setRemainingETC] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCycle, setIsCycle] = useState<boolean>(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/task");
        const data = await res.json();
        console.log("Fetched Tasks:", data);
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

    if (isCycle && selectedTask?.cycleCount) {
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
  }, [isCycle, currentCycle, selectedTask]);

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

  const handleTaskClick = async (task: Task) => {
    setSelectedTask(task);
    setCurrentCycle(0);
    setIsRunning(false);

    const initialETC = parseInt(task.etc?.split(" ")[0] || "0", 10);
    setRemainingETC(initialETC);

    // Update CSV file
    await fetch('/api/taskcsv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'stop', // Initial state
        task: {
          part: task.part || 'Unknown Part',
          pos1: task.pos1 || '0',
          pos2: task.pos2 || '0',
          totalCycle: task.cycleCount || '0',
          currentCycle: '0',
        },
      }),
    });
  };

  const handleRunClick = async () => {
    setIsCycle(true);

    // Update CSV file
    await fetch('/api/taskcsv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'running',
        task: {
          part: selectedTask?.part || 'Unknown Part',
          pos1: selectedTask?.pos1 || '0',
          pos2: selectedTask?.pos2 || '0',
          totalCycle: selectedTask?.cycleCount || '0',
          currentCycle: `${currentCycle}`,
        },
      }),
    });
  };

  const handlePauseClick = async () => {
    setIsCycle(false);

    // Update CSV file
    await fetch('/api/taskcsv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'pause',
        task: {
          part: selectedTask?.part || 'Unknown Part',
          pos1: selectedTask?.pos1 || '0',
          pos2: selectedTask?.pos2 || '0',
          totalCycle: selectedTask?.cycleCount || '0',
          currentCycle: `${currentCycle}`,
        },
      }),
    });
  };

  const handleStopClick = async () => {
    setIsCycle(false);
    setCurrentCycle(0);
    setRemainingETC(parseInt(selectedTask?.etc?.split(" ")[0] || "0", 10));

    // Update CSV file
    await fetch('/api/taskcsv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'stop',
        task: {
          part: selectedTask?.part || 'Unknown Part',
          pos1: selectedTask?.pos1 || '0',
          pos2: selectedTask?.pos2 || '0',
          totalCycle: selectedTask?.cycleCount || '0',
          currentCycle: '0',
        },
      }),
    });
  };

  const handleEditClick = (id: string) => {
    // if (task?.testMethod === "standard") {
    //   alert("Standard method cannot be edited.");
    // } else {
      // Redirect to the edit page with the task ID
      window.location.href = `/editTask/${id}`;
    // }
  };

  // const handleDeleteClick = async (taskId: string) => {
  //   try {
  //     const response = await fetch(`/api/task?id=${taskId}`, {
  //       method: "DELETE",
  //     });

  //     if (response.ok) {
  //       // Remove the task from the list
  //       setTasks(tasks.filter((task) => task.id !== taskId));
  //     } else {
  //       console.error("Failed to delete task");
  //     }
  //   } catch (error) {
  //     console.error("Error deleting task:", error);
  //   }
  // };

  const handleCheckboxChange = (taskId: string) => {
    setSelectedTasks((prevSelected) =>
      prevSelected.includes(taskId)
        ? prevSelected.filter((id) => id !== taskId)
        : [...prevSelected, taskId]
    );
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div>
      <NavBar />
      <div className="p-8 h-screen font-poppins">
        <h1 className="text-2xl font-bold mb-4 text-[#DA7534] flex justify-center">
          {isRunning ? "Manual Test" : "Current Task"}
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
                {truncateText(selectedTask?.taskName || "Select a task", 20)}
              </div>
            </div>
            {!isRunning && (
              <>
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
              </>
            )}
            
          </div>

          {/* Second Column (Buttons) */}
          <div className="border p-4 rounded-lg flex justify-center items-center">
            <div className="flex gap-4">
              <button
                className="flex items-center justify-center bg-[#588C91] text-white p-3 rounded-full hover:bg-blue-600"
                onClick={handleRunClick}
                disabled={isRunning}
              >
                <PlayIcon className="h-6 w-6" />
              </button>
              <button
                className="flex items-center justify-center bg-[#588C91] text-white p-3 rounded-full hover:bg-yellow-600"
                onClick={handlePauseClick}
              >
                <PauseIcon className="h-6 w-6" />
              </button>
              <button
                className="flex items-center justify-center bg-[#588C91] text-white p-3 rounded-full hover:bg-red-600"
                onClick={handleStopClick}
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
                {truncateText(selectedTask?.part || "N/A", 20)}
              </div>
            </div>
            {!isRunning && (
              <>
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
              <div className="flex items-center">
              <label className="w-24 font-bold text-[#DA7534]">Test Method:</label>
              <div className="p-2 bg-gray-100 rounded-md text-gray-800 flex-grow">
                {selectedTask?.testMethod || "N/A"}
              </div>
            </div>
              </>
            )}
            
          </div>
        </div>

        {/* Task Table */}
        <div className="overflow-x-auto mt-6">
          <div className="max-h-[280px] overflow-y-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg border">
              <thead className="sticky top-0 bg-[#588C91] text-gray-100 h-20">
                <tr>
                  <th className="p-2 text-left">Select</th>
                  <th className="p-2 text-left">S.no</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Task Name</th>
                  <th className="p-2 text-left">ETC</th>
                  <th className="p-2 text-left">Cycle Count</th>
                  <th className="p-2 text-left">Part Name</th>
                  <th className="p-2 text-left">Test Method</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr
                    key={index}
                    className="border-t cursor-pointer hover:bg-gray-100"
                    onClick={() => handleTaskClick(task)}
                  >
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => handleCheckboxChange(task.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">
                      {new Date(task.createdAt || "").toLocaleDateString()}
                    </td>
                    <td className="p-2">{truncateText(task.taskName, 20)}</td>
                    <td className="p-2">{task.etc}</td>
                    <td className="p-2">{task.cycleCount}</td>
                    <td className="p-2">{task.part}</td>
                    <td className="p-2">{truncateText(task.testMethod || "N/A", 20)}</td>
                    <td className="p-2">
                      <button
                        className="bg-[#F9594C] text-white px-4 py-1 rounded-md hover:bg-[#F79251]"
                        onClick={() => handleEditClick(task.id)}
                      >
                        Edit
                      </button>
                      {/* <button
                        className="bg-[#F9594C] text-white px-4 py-1 rounded-md hover:bg-[#F79251] ml-2"
                        onClick={() => handleDeleteClick(task.id)}
                      >
                        Delete
                      </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Absolute Buttons in Bottom Right */}
        <div className="fixed bottom-24 right-5 flex gap-4">
          <button className="bg-[#267f87] text-white px-10 py-4 rounded-md hover:bg-blue-600"
          onClick={handleRunClick}>
            Run Task
          </button>
          <button className="bg-[#DA7534] text-white px-10 py-4 rounded-md hover:bg-orange-600">
            Report
          </button>
            <button 
            className="bg-[#F9594C] text-white px-10 py-4 rounded-md hover:bg-red-600"
            onClick={() => setIsRunning((prev) => !prev)}
            >
            {isRunning ? "Auto" : "Manual"}
            </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;