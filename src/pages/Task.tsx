"use client";
import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function TaskForm() {
  // Form state
  const [taskName, setTaskName] = useState("");
  const [pos1, setPos1] = useState("0");
  const [pos2, setPos2] = useState("0");
  const [speed, setSpeed] = useState("0");
  const [cycleCount, setCycleCount] = useState("0");
  const [runTime, setRunTime] = useState("0");
  const [totalCycleCount, setTotalCycleCount] = useState("0");
  const [totalRunTime, setTotalRunTime] = useState("0");
  const [restTime, setRestTime] = useState("0");
  const [motionType, setMotionType] = useState("LINEAR");
  const [posUnit, setPosUnit] = useState("MM"); // Default to MM
  const [part, setPart] = useState("");
  const [speedUnit, setSpeedUnit] = useState("MS"); // Default to MS
  const [testMethod, setTestMethod] = useState(() => {
    return localStorage.getItem("userRole") === "admin" ? "standard" : "custom";
  });

  // API and UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  interface Product {
    id: string;
    name: string;
    parts: Part[];
  }

  interface Part {
    id: string;
    name: string;
    pos1?: string;
    pos2?: string;
    speed?: string;
    motionType?: string;
    unit?: string;
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [parts, setParts] = useState<{}[]>([]);

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

  // Fetch products from backend API
  const fetchProducts = async () => {
    try {
      // setLoading(true);
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setMessage("Failed to load products.");
      const selectedProduct = products.find((p) => p.id === selectedProductId);
      // setLoading(false);
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
  
    const selectedProduct = products.find((p: any) => p.id === productId);
    if (selectedProduct) {
      setTaskName(selectedProduct.name || "");
  
      // Reset part selection
      setPart("");
  
      // Reset motion and other part-specific fields
      setMotionType("");
      setPos1("0");
      setPos2("0");
      setSpeed("0");
      setPosUnit("MM");
      setSpeedUnit("MS");
  
      // Set available parts for this product
      setParts(selectedProduct.parts || []);
    }
  };
  
  // Automatically select the first product on component mount or when products change
  useEffect(() => {
    if (products.length > 0) {
      const firstProduct = products[0];
      setSelectedProductId(firstProduct.id);
  
      // Trigger the selection logic
      const event = {
        target: { value: firstProduct.id }
      } as React.ChangeEvent<HTMLSelectElement>;
  
      handleProductSelect(event);
    }
  }, [products]);

  // Handle part selection
  const handlePartSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPart = e.target.value;
    setPart(selectedPart);

    if (!selectedPart) {
      // Reset part-specific fields if no part selected
      setPos1("0");
      setPos2("0");
      setSpeed("0");
      setMotionType("");
      setPosUnit("MM");
      setSpeedUnit("MS");
      return;
    }

    const selectedProduct = products.find(
      (p: any) => p.id === selectedProductId
    );

    if (selectedProduct && selectedProduct.parts) {
      const partData = selectedProduct.parts.find(
        (p: any) => p.id === selectedPart || p.name === selectedPart
      );

      if (partData) {
        if (partData.pos1) setPos1(partData.pos1);
        if (partData.pos2) setPos2(partData.pos2);
        if (partData.speed) setSpeed(partData.speed);

        if (partData.motionType) {
          setMotionType(partData.motionType);

          if (partData.motionType === "LINEAR") {
            setSpeedUnit("MS");
            setPosUnit("MM");
          } else if (partData.motionType === "ROTARY") {
            setSpeedUnit("DS");
            setPosUnit("DEG");
          }
        }

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
    setRunTime("0");
    setRestTime("0");
    setTotalCycleCount("0");
    setTotalRunTime("0");
    setMotionType("LINEAR");
    setPart("");
    setTestMethod("standard");
    setSelectedProductId("");
    setParts([]);
    setPosUnit("MM");
    setSpeedUnit("MS");
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const taskData = {
      taskName: taskName.trim() || "Untitled Task",
      productId: selectedProductId.trim() || "Unknown",
      part: part.trim() || "N/A",
      pos1: parseFloat(pos1),
      pos2: parseFloat(pos2),
      posUnit: posUnit.toUpperCase(),
      speed: parseFloat(speed),
      speedUnit: speedUnit.toUpperCase(),
      cycleCount: parseInt(cycleCount),
      totalCycleCount: parseInt(totalCycleCount),
      runTime: parseFloat(runTime),
      totalRunTime: parseFloat(totalRunTime),
      restTime: parseFloat(restTime),
      motionType: motionType.toUpperCase(),
      testMethod: testMethod,
    };

    console.log("Submitting with form data:", taskData);
    try {
      const response = await fetch("/api/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      let responseData;
      const textResponse = await response.text();

      try {
        responseData = JSON.parse(textResponse);
      } catch (e) {
        responseData = { message: textResponse };
      }

      console.log("API Response:", responseData);

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(
            `Validation error: ${
              responseData.error || responseData.message || "Check your inputs"
            }`
          );
        } else if (response.status === 409) {
          throw new Error(
            `Duplicate record: ${
              responseData.error ||
              responseData.message ||
              "This task already exists"
            }`
          );
        } else if (response.status === 500) {
          throw new Error(
            `Server error: ${
              responseData.error ||
              responseData.message ||
              "Please try again later"
            }`
          );
        } else {
          throw new Error(
            `API Error (${response.status}): ${
              responseData.error || responseData.message
            }`
          );
        }
      }

      alert("Task added successfully!");
      resetForm();
      setMessage("Task submitted successfully!");
    } catch (error) {
      console.error("Fetch Error:", error);
      setMessage(
        `Failed to submit task: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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

        <div className="bg-slate-200 p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Task Name
                </label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                />
                {/* <select
                  value={selectedProductId}
                  onChange={handleProductSelect}
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                >
                  <option value="">Select a Product</option>
                  {products.map((product: any) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select> */}
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
                  {parts.map((partOption: any) => (
                    <option
                      key={partOption.id || partOption.name}
                      value={partOption.name}
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
                  {localStorage.getItem("userRole") === "admin" ? (
                    <option value="standard">Standard</option>
                  ) : 
                  <option value="custom">Custom</option>}
                  {/* <option value="standard">Standard</option>
                  <option value="custom">Custom</option> */}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Position 1
                </label>
                <input
                  type="number"
                  value={pos1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    const selectedProduct = products.find(
                      (p: any) => p.id === selectedProductId
                    );
                    const partData = selectedProduct?.parts.find(
                      (p: any) => p.id === part || p.name === part
                    );
                    if (!isNaN(value)) {
                      const min = partData?.pos1 ? parseInt(partData.pos1, 10) : 0; // Set the minimum value
                      const max = partData?.pos2 ? parseInt(partData.pos2, 10) : 100; // Set the maximum value
                      setPos1((value < min ? min : value > max ? max : value).toString());  // Limit the value within the range
                    } else {
                      setPos1('');  // Clear invalid input
                    }
                  }}
                  // onChange={(e) => setPos1(e.target.value)}
                  className={`w-full p-3 border rounded-md shadow-sm ${
                    testMethod === "standard" ? "bg-white" : "bg-white"
                  }`}
                  // readOnly={testMethod === "standard"}
                  // required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Position 2 (Max:{(() => {
                    const selectedProduct = products.find(
                      (p: any) => p.id === selectedProductId
                    );
                    const partData = selectedProduct?.parts.find(
                      (p: any) => p.id === part || p.name === part
                    );
                    return partData?.pos2 || "N/A";
                  })()})
                  </label>
                <input
                  type="number"
                  value={pos2}
                  onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  const selectedProduct = products.find(
                    (p: any) => p.id === selectedProductId
                  );
                  const partData = selectedProduct?.parts.find(
                    (p: any) => p.id === part || p.name === part
                  );
                  if (!isNaN(value)) {
                    const min = partData?.pos1 ? parseInt(partData.pos1, 10) : 0; // Set the minimum value
                    const max = partData?.pos2 ? parseInt(partData.pos2, 10) : 100; // Set the maximum value
                    setPos2((value < min ? min : value > max ? max : value).toString());  // Limit the value within the range
                  } else {
                    setPos2('');  // Clear invalid input
                  }
                  }}
                  // onChange={(e) => setPos2(e.target.value)}
                  className={`w-full p-3 border rounded-md shadow-sm ${
                    testMethod === "standard" ? "bg-white" : "bg-white"
                  }`}
                  min={pos1}
                  
                  // readOnly={testMethod === "standard"}
                  // required
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
                  <option value="LINEAR">Linear</option>
                  <option value="ROTARY">Rotary</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Position Unit
                </label>
                <select
                  value={posUnit}
                  onChange={(e) => setPosUnit(e.target.value)}
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                >
                  {motionType === "LINEAR" ? (
                    <>
                      <option value="MM">MM</option>
                      <option value="CM">CM</option>
                      <option value="M">M</option>
                      {/* <option value="KM">KM</option> */}
                    </>
                  ) : motionType === "ROTARY" ? (
                    <>
                      <option value="DEG">DEG</option>
                      <option value="RAD">RAD</option>
                    </>
                  ) : (
                    <option value="MM">MM</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Speed (Max:{(() => {
                  const selectedProduct = products.find(
                    (p: any) => p.id === selectedProductId
                  );
                  const partData = selectedProduct?.parts.find(
                    (p: any) => p.id === part || p.name === part
                  );
                  return partData?.speed || "N/A";
                  })()})
                  
                </label>
                <input
                  type="number"
                  value={speed}
                  onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  const selectedProduct = products.find(
                    (p: any) => p.id === selectedProductId
                  );
                  const partData = selectedProduct?.parts.find(
                    (p: any) => p.id === part || p.name === part
                  );
                  if (!isNaN(value)) {
                    const max = partData?.speed ? parseFloat(partData.speed) : 100; // Set the maximum value
                    setSpeed((value > max ? max : value).toString()); // Limit the value within the range
                  } else {
                    setSpeed(''); // Clear invalid input
                  }
                  }}
                  className={`w-full p-3 border rounded-md shadow-sm ${
                  testMethod === "standard" ? "bg-white" : "bg-white"
                  }`}
                  // readOnly={testMethod === "standard"}
                  // required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Speed Unit
                </label>
                <select
                  value={speedUnit}
                  onChange={(e) => setSpeedUnit(e.target.value)}
                  className="w-full p-3 border rounded-md shadow-sm"
                  required
                >
                  {motionType === "LINEAR" ? (
                    <>
                      <option value="MS">MS</option>
                     
                    </>
                  ) : motionType === "ROTARY" ? (
                    <>
                      <option value="DS">DS</option>
                    </>
                  ) : (
                    <option value="MS">MS</option>
                  )}
                </select>
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
