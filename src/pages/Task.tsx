"use client";
import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function TaskForm() {
  // Form state
  const [taskName, setTaskName] = useState("");
  const [pos1, setPos1] = useState("");
  const [pos2, setPos2] = useState("");
  const [speed, setSpeed] = useState("");
  const [cycleCount, setCycleCount] = useState("");
  const [runTime, setRunTime] = useState("");
  const [totalCycleCount, setTotalCycleCount] = useState("");
  const [totalRunTime, setTotalRunTime] = useState("");
  const [restTime, setRestTime] = useState("");
  const [motionType, setMotionType] = useState("");
  const [posUnit, setPosUnit] = useState("mm"); // Unit for position (mm, cm, etc.)
  const [part, setPart] = useState("");
  const [speedUnit, setSpeedUnit] = useState("M/S"); // Default speed unit
  const [testMethod, setTestMethod] = useState("standard"); // standard or custom

  // API and UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<
    {
      id: string;
      name: string;
      parts: {
        id: string;
        name: string;
        motionType?: string;
        pos1?: string;
        pos2?: string;
        speed?: string;
        unit?: string;
      }[];
    }[]
  >([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [parts, setParts] = useState<
    {
      id: string;
      name: string;
      motionType?: string;
      pos1?: string;
      pos2?: string;
      speed?: string;
      unit?: string;
    }[]
  >([]);

  // Calculate total run time whenever relevant fields change
  useEffect(() => {
    if (runTime && totalCycleCount && cycleCount) {
      const totalRunTimeValue =
        (parseFloat(runTime) * parseFloat(totalCycleCount)) /
        parseFloat(cycleCount);
      setTotalRunTime(totalRunTimeValue.toFixed(2));
    } else {
      setTotalRunTime("");
    }
  }, [runTime, totalCycleCount, cycleCount]);

  // Fetch products from API on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Update speed unit when motion type changes
  useEffect(() => {
    if (motionType === "Linear") {
      setSpeedUnit("M/S");
      setPosUnit("mm");
    } else if (motionType === "Rotary") {
      setSpeedUnit("DEG/S");
      setPosUnit("deg");
    }
  }, [motionType]);

  // Fetch products from backend API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setMessage("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  // Handle product selection
  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    setSelectedProductId(productId);

    if (!productId) {
      // Reset form if no product selected
      resetForm();
      return;
    }

    const selectedProduct = products.find((p) => p.id === productId);
    if (selectedProduct) {
      setTaskName(selectedProduct.name || "");

      // Reset part selection
      setPart("");

      // Reset motion and other part-specific fields
      setMotionType("");
      setPos1("");
      setPos2("");
      setSpeed("");
      setPosUnit("mm");
      setSpeedUnit("M/S");

      // Set available parts for this product
      setParts(selectedProduct.parts || []);
    }
  };

  // Handle part selection
  const handlePartSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPart = e.target.value;
    setPart(selectedPart);

    if (!selectedPart) {
      // Reset part-specific fields if no part selected
      setPos1("");
      setPos2("");
      setSpeed("");
      setMotionType("");
      setPosUnit("mm");
      setSpeedUnit("M/S");
      return;
    }

    // Find the selected product
    const selectedProduct = products.find((p) => p.id === selectedProductId);

    // Find the part data in the selected product
    if (selectedProduct && selectedProduct.parts) {
      const partData = selectedProduct.parts.find(
        (p) => p.id === selectedPart || p.name === selectedPart
      );

      if (partData) {
        console.log("Selected part data:", partData);

        // Pre-fill form with part data if available
        if (partData.pos1) setPos1(partData.pos1);
        if (partData.pos2) setPos2(partData.pos2);
        if (partData.speed) setSpeed(partData.speed);

        // Set motion and adjust units accordingly
        if (partData.motionType) {
          console.log("Setting motion to:", partData.motionType);
          // Set the motion directly
          setMotionType(partData.motionType);

          // Update units based on motion type
          if (partData.motionType === "LINEAR") {
            setSpeedUnit("M/S");
            setPosUnit("mm");
          } else if (partData.motionType === "ROTARY") {
            setSpeedUnit("DEG/S");
            setPosUnit("deg");
          }
        } else {
          console.log("No motion data found for this part");
        }

        // Set custom unit if provided
        if (partData.unit) {
          setPosUnit(partData.unit);
        }
      }
    }
  };

  // Reset form fields
  const resetForm = () => {
    setTaskName("");
    setPos1("0");
    setPos2("0");
    setSpeed("0");
    setCycleCount("0");
    setRunTime("");
    setRestTime("");
    setTotalCycleCount("");
    setTotalRunTime("");
    setMotionType("");
    setPart("");
    setTestMethod("standard");
    setSelectedProductId("");
    setParts([]);
    setPosUnit("mm");
    setSpeedUnit("M/S");
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const taskData = {
      taskName: String(taskName), // Ensure string type
      part: String(part), // Ensure string type
      productId: String(selectedProductId), // Ensure string type

      pos1: pos1 != null ? parseFloat(pos1) : null, // Convert to float or set to null
      pos2: pos2 != null ? parseFloat(pos2) : null, // Convert to float or set to null

      posUnit: posUnit ? String(posUnit) : null, // Ensure string type or null

      speed: speed != null ? parseFloat(speed) : null, // Convert to float or null

      cycleCount: cycleCount != null ? parseFloat(cycleCount) : null, // Convert to float or null
      totalCycleCount:
        totalCycleCount != null ? parseFloat(totalCycleCount) : null, // Convert to float or null

      runTime: runTime != null ? parseFloat(runTime) : null, // Convert to float or null
      totalRunTime: totalRunTime != null ? parseFloat(totalRunTime) : null, // Convert to float or null

      restTime: restTime ? String(restTime) : null, // Ensure string or null
      motionType: String(motionType), // Ensure string type
      testMethod: testMethod ? String(testMethod) : null, // Ensure string or null
    };

    console.log("Submitting task data:", taskData);
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

      try {
        const jsonResponse = JSON.parse(textResponse);
        console.log("Parsed JSON Response:", jsonResponse);
      } catch (parseError) {
        console.warn("Response is not valid JSON:", textResponse);
      }

      alert("Task added successfully!");
      resetForm();
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
      <div className="p-6 w-[90%] h-full mx-auto my-8 font-poppins">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Create New Task
        </h2>

        {/* Main Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            {/* Row 1: Product, Part, Test Method */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Product Name
                </label>
                <select
                  value={selectedProductId}
                  onChange={handleProductSelect}
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                >
                  <option value="">Select a Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Part Name
                </label>
                <select
                  value={part}
                  onChange={handlePartSelect}
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                  disabled={!selectedProductId}
                >
                  <option value="">Select Part</option>
                  {parts.map((partOption) => (
                    <option
                      key={partOption.id || partOption.name}
                      value={partOption.name} // ✅ Use part name as the value
                    >
                      {partOption.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Test Method
                </label>
                <select
                  value={testMethod}
                  onChange={(e) => setTestMethod(e.target.value)}
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                  disabled={!part}
                >
                  <option value="standard">Standard</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            {/* Row 2: Position 1, Position 2, Motion Type, Position Unit */}
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Position 1
                </label>
                <input
                  type="number"
                  value={pos1}
                  onChange={(e) => setPos1(e.target.value)}
                  className={`w-full p-3 border rounded-md shadow-sm ${
                    testMethod === "standard" ? "bg-gray-100" : "bg-white"
                  }`}
                  readOnly={testMethod === "standard"}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Position 2
                </label>
                <input
                  type="number"
                  value={pos2}
                  onChange={(e) => setPos2(e.target.value)}
                  className={`w-full p-3 border rounded-md shadow-sm ${
                    testMethod === "standard" ? "bg-gray-100" : "bg-white"
                  }`}
                  readOnly={testMethod === "standard"}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Motion Type
                </label>
                <select
                  value={motionType}
                  onChange={(e) => setMotionType(e.target.value)}
                  className={`w-full p-3 border rounded-md shadow-sm ${
                    testMethod === "standard" ? "bg-gray-100" : "bg-white"
                  }`}
                  required
                  disabled={testMethod === "standard"}
                >
                  <option value="">{motionType}</option>
                  <option value="Linear">Linear</option>
                  <option value="Rotary">Rotary</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Position Unit
                </label>
                <input
                  type="text"
                  value={posUnit}
                  readOnly
                  className="w-full p-3 border rounded-md shadow-sm bg-gray-100"
                />
              </div>
            </div>

            {/* Row 3: Speed, Speed Unit, Cycle Count, Rest Time */}
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Speed
                </label>
                <input
                  type="number"
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className={`w-full p-3 border rounded-md shadow-sm ${
                    testMethod === "standard" ? "bg-gray-100" : "bg-white"
                  }`}
                  readOnly={testMethod === "standard"}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Speed Unit
                </label>
                <input
                  type="text"
                  value={speedUnit}
                  className="w-full p-3 border rounded-md shadow-sm bg-gray-100"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Cycle Count
                </label>
                <input
                  type="number"
                  value={cycleCount}
                  onChange={(e) => setCycleCount(e.target.value)}
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
                  value={restTime}
                  onChange={(e) => setRestTime(e.target.value)}
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Row 4: Run Time, Total Cycles, Total Run Time */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Run Time (hr)
                </label>
                <input
                  type="number"
                  value={runTime}
                  onChange={(e) => setRunTime(e.target.value)}
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
                  value={totalCycleCount}
                  onChange={(e) => setTotalCycleCount(e.target.value)}
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
                  value={totalRunTime}
                  className="w-full p-3 border rounded-md shadow-sm bg-gray-100"
                  readOnly
                />
              </div>
            </div>

            {/* Debug Information */}
            {process.env.NODE_ENV === "development" && (
              <div className="mb-4 p-3 bg-gray-100 rounded-md">
                <h3 className="font-bold">Debug Info:</h3>
                <p>Motion value: {motionType || "Not set"}</p>
                <p>Test Method: {testMethod}</p>
                <p>Selected Product ID: {selectedProductId}</p>
                <p>Selected Part: {part}</p>
              </div>
            )}

            {/* Form Controls */}
            <div className="flex justify-between items-center mt-6">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-500 text-white font-bold rounded-md hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>

              <button
                type="submit"
                className={`px-6 py-3 font-bold rounded-md ${
                  loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
                } text-white transition-colors`}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Task"}
              </button>
            </div>

            {/* Status Message */}
            {message && (
              <div
                className={`mt-4 p-3 rounded-md ${
                  message.includes("success")
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Loading State */}
        {loading && products.length === 0 && (
          <div className="text-center p-4 mt-4 bg-blue-50 rounded-md">
            <p className="text-blue-800">Loading products...</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
