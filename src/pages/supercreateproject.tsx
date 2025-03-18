"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { ArrowLeft } from "lucide-react";

interface Part {
  name: string;
  motionType: "LINEAR" | "ROTARY";
  pos1: number | null;
  pos2: number | null;
  speed: number | null;
  unit: string;
}

const CreateProject = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [parts, setParts] = useState<Part[]>([
    { name: "", motionType: "LINEAR", pos1: null, pos2: null, speed: null, unit: "MM" },
  ]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addPart = () => {
    setParts([...parts, { name: "", motionType: "LINEAR", pos1: null, pos2: null, speed: null, unit: "MM" }]);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
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
      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image);

      const productRes = await axios.post("/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const productId = productRes.data.id;

      const validParts = parts.filter((part) => part.name.trim() !== "");

      await Promise.all(
        validParts.map((part) => {
          const payload = {
            productId,
            name: part.name,
            motionType: part.motionType,
            pos1: part.pos1,
            pos2: part.pos2,
            speed: part.speed,
            unit: part.unit,
          };

          console.log("Sending data:", payload);

          return axios.post("/api/parts", payload);
        })
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

        {/* Back button */}
        <div className="self-start mb-4">
          <button
            onClick={() => router.push("/productdashboard")}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
          >
            <ArrowLeft size={24} />
            <span className="text-lg font-semibold">Back to Dashboard</span>
          </button>
        </div>

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

          <label className="block mb-2 text-xl font-semibold">Product Image:</label>
          <input
            type="file"
            onChange={handleImageChange}
            className="border p-2 rounded w-full mb-4 bg-gray-300"
            accept="image/*"
          />

          <h2 className="text-xl font-semibold mb-2">Parts</h2>

          {parts.map((part, index) => (
            <div key={index} className="border p-3 rounded mb-4 relative">
              {parts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePart(index)}
                  className="absolute top-2 right-2 text-red-500 text-lg"
                >
                  ✕
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
                    setParts(
                      parts.map((p, i) =>
                        i === index
                          ? {
                              ...p,
                              motionType: e.target.value as "LINEAR" | "ROTARY",
                              unit: e.target.value === "ROTARY" ? "DEG" : "MM",
                            }
                          : p
                      )
                    )
                  }
                  className="border p-2 rounded bg-gray-300"
                >
                  <option value="LINEAR">Linear</option>
                  <option value="ROTARY">Rotary</option>
                </select>
              </div>

              <div className="flex gap-4 mb-2 items-center">
                <input
                  type="number"
                  placeholder="Pos1"
                  value={part.pos1 ?? ""}
                  onChange={(e) =>
                    setParts(parts.map((p, i) => (i === index ? { ...p, pos1: Number(e.target.value) } : p)))
                  }
                  className="border p-2 rounded w-full bg-gray-300"
                />
                
                <input
                  type="number"
                  placeholder="Pos2"
                  value={part.pos2 ?? ""}
                  onChange={(e) =>
                    setParts(parts.map((p, i) => (i === index ? { ...p, pos2: Number(e.target.value) } : p)))
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
                  {part.motionType === "LINEAR" ? (
                    <>
                      <option value="MM">MM</option>
                      <option value="CM">CM</option>
                    </>
                  ) : (
                    <option value="DEG">DEG</option>
                  )}
                </select>
              </div>

              {/* Speed Field */}
              <div className="flex gap-4 items-center mb-2">
                <input
                  type="number"
                  placeholder="Speed"
                  value={part.speed ?? ""}
                  onChange={(e) =>
                    setParts(parts.map((p, i) => (i === index ? { ...p, speed: Number(e.target.value) } : p)))
                  }
                  className="border p-2 rounded w-full bg-gray-300"
                />
                <span className="text-gray-700">
                  {part.motionType === "LINEAR" ? "mm/s" : "deg/s"}
                </span>
              </div>
            </div>
          ))}

          <button type="button" onClick={addPart} className="text-orange-500 font-semibold mb-4">
            + Add Part
          </button>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-md hover:bg-orange-600 disabled:opacity-50"
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
