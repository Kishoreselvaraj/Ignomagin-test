"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

interface Part {
  name: string;
  motionType: "LINEAR" | "ROTARY";
  pos1: number; 
  pos2: number ;
  value?: number;
  unit?: string; // ✅ Now used for both LINEAR and ROTARY
}

const CreateProject = () => {
  const [name, setName] = useState("");
  const [parts, setParts] = useState<Part[]>([
    { name: "", motionType: "LINEAR", pos1: 0, pos2: 0 , unit: "MM" },
  ]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addPart = () => {
    setParts([...parts, { name: "", motionType: "LINEAR", pos1: 0, pos2: 0 , unit: "MM" }]);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
      alert("Product name is required.");
      setLoading(false);
      return;
    }

    try {
      const productRes = await axios.post("/api/products", { name });
      const productId = productRes.data.id;

      const validParts = parts.filter((part) => part.name.trim() !== "");

      await Promise.all(
        validParts.map((part) =>
          axios.post("/api/parts", {
            productId,
            name: part.name,
            motionType: part.motionType,
            pos1: part.motionType === "LINEAR" ? part.pos1 : undefined,
            pos2: part.motionType === "LINEAR" ? part.pos2 : undefined,
            value: part.motionType === "ROTARY" ? part.value : undefined,
            unit: part.unit, // ✅ Now always sending the unit, whether LINEAR or ROTARY
          })
        )
      );

      router.push("/productdashboard");
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <NavBar />
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Create Product</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-1/2">
          <label className="block mb-2 text-xl font-semibold">Product Name:</label>
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full mb-4 bg-gray-300"
            required
          />

          <h2 className="text-xl font-semibold mb-2">Parts</h2>

          {parts.map((part, index) => (
            <div key={index} className="border pt-10 p-3 rounded mb-4 relative">
              {parts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePart(index)}
                  className="absolute  top-2 right-2 text-red-500  text-lg"
                >
                  Remove
                </button>
              )}

              <div className="flex gap-4 mb-2">
                <input
                  type="text"
                  placeholder="Part Name"
                  value={part.name}
                  onChange={(e) =>
                    setParts(parts.map((p, i) => (i === index ? { ...p, name: e.target.value } : p)))
                  }
                  className="border p-2 rounded w-full bg-gray-300"
                  required
                />

                <select
                  value={part.motionType}
                  onChange={(e) =>
                    setParts(parts.map((p, i) => (i === index ? { ...p, motionType: e.target.value as "LINEAR" | "ROTARY" } : p)))
                  }
                  className="border p-2 rounded bg-gray-300"
                >
                  <option value="LINEAR">Linear</option>
                  <option value="ROTARY">Rotary</option>
                </select>
              </div>

              {part.motionType === "LINEAR" && (
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Pos1"
                    value={part.pos1 || ""}
                    onChange={(e) =>
                      setParts(parts.map((p, i) => (i === index ? { ...p, pos1: Number(e.target.value) } : p)))
                    }
                    className="border p-2 rounded w-full bg-gray-300"
                  />
                  <input
                    type="number"
                    placeholder="Pos2"
                    value={part.pos2 || ""}
                    onChange={(e) =>
                      setParts(parts.map((p, i) => (i === index ? { ...p, pos2: Number(e.target.value) } : p)))
                    }
                    className="border p-2 rounded w-full bg-gray-300"
                  />
                </div>
              )}

              {/* ✅ Added Unit Dropdown for LINEAR */}
              {part.motionType === "LINEAR" && (
                <select
                  value={part.unit}
                  onChange={(e) =>
                    setParts(parts.map((p, i) => (i === index ? { ...p, unit: e.target.value } : p)))
                  }
                  className="border p-2 rounded bg-gray-300 w-full mt-2"
                >
                  <option value="MM">MM</option>
                  <option value="CM">CM</option>
                  <option value="IN">IN</option>
                </select>
              )}

              {part.motionType === "ROTARY" && (
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Enter Value"
                    value={part.value || ""}
                    onChange={(e) =>
                      setParts(parts.map((p, i) => (i === index ? { ...p, value: Number(e.target.value) } : p)))
                    }
                    className="border p-2 rounded w-full bg-gray-300"
                  />

                  <select
                    value={part.unit}
                    onChange={(e) =>
                      setParts(parts.map((p, i) => (i === index ? { ...p, unit: e.target.value } : p)))
                    }
                    className="border p-2 rounded bg-gray-300"
                  >
                    <option value="DEG">DEG</option>
                    <option value="RAD">RAD</option>
                  </select>
                </div>
              )}
            </div>
          ))}

          <button type="button" onClick={addPart} className="text-orange-500 font-semibold mb-4">
            + Add Part
          </button>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-md transition-transform transform hover:scale-105 hover:bg-orange-600 active:scale-95 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Product"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateProject;
