"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

interface Part {
  name: string;
  motionType: "LINEAR" | "ROTARY";
  pos1?: number | null;
  pos2?: number | null;
  value?: number | null;
  unit: string;
}

const CreateProject = () => {
  const [name, setName] = useState("");
  const [parts, setParts] = useState<Part[]>([
    { name: "", motionType: "LINEAR", pos1: 0, pos2: 0, unit: "MM" },
  ]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddPart = () => {
    setParts([...parts, { name: "", motionType: "LINEAR", pos1: 0, pos2: 0, unit: "MM" }]);
  };

  const handlePartChange = (index: number, field: keyof Part, value: string | number) => {
    setParts((prevParts) =>
      prevParts.map((part, i) =>
        i === index
          ? {
              ...part,
              [field]: value,
              ...(field === "motionType"
                ? {
                    unit: value === "LINEAR" ? "MM" : "DEG",
                    pos1: value === "LINEAR" ? 0 : null,
                    pos2: value === "LINEAR" ? 0 : null,
                    value: value === "ROTARY" ? 0 : null,
                  }
                : {}),
            }
          : part
      )
    );
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
      formData.append("parts", JSON.stringify(parts));

      const response = await axios.post("/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        router.push("/productdashboard");
      }
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

          <h2 className="text-xl font-semibold mb-2">Product Image</h2>
          <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
          {preview && <img src={preview} alt="Preview" className="h-40 w-40 object-cover rounded-lg mb-4" />}

          <h2 className="text-xl font-semibold mb-2">Parts</h2>
          {parts.map((part, index) => (
            <div key={index} className="border p-3 rounded mb-4 relative">
              {parts.length > 1 && (
                <button
                  type="button"
                  onClick={() => setParts(parts.filter((_, i) => i !== index))}
                  className="absolute top-2 right-2 text-red-500 text-lg"
                >
                  ✕
                </button>
              )}

              <input
                type="text"
                placeholder="Part Name"
                value={part.name}
                onChange={(e) => handlePartChange(index, "name", e.target.value)}
                className="border p-2 rounded w-full bg-gray-300 mb-2"
                required
              />

              <label className="block mb-1">Motion Type:</label>
              <select
                value={part.motionType}
                onChange={(e) => handlePartChange(index, "motionType", e.target.value)}
                className="border p-2 rounded w-full bg-gray-300 mb-2"
              >
                <option value="LINEAR">Linear</option>
                <option value="ROTARY">Rotary</option>
              </select>

              {part.motionType === "LINEAR" ? (
                <>
                  <label className="block mb-1">Position 1:</label>
                  <input
                    type="number"
                    value={part.pos1 ?? ""}
                    onChange={(e) => handlePartChange(index, "pos1", Number(e.target.value))}
                    className="border p-2 rounded w-full bg-gray-300 mb-2"
                  />

                  <label className="block mb-1">Position 2:</label>
                  <input
                    type="number"
                    value={part.pos2 ?? ""}
                    onChange={(e) => handlePartChange(index, "pos2", Number(e.target.value))}
                    className="border p-2 rounded w-full bg-gray-300 mb-2"
                  />
                </>
              ) : (
                <>
                  <label className="block mb-1">Value:</label>
                  <input
                    type="number"
                    value={part.value ?? ""}
                    onChange={(e) => handlePartChange(index, "value", Number(e.target.value))}
                    className="border p-2 rounded w-full bg-gray-300 mb-2"
                  />
                </>
              )}

              <label className="block mb-1">Unit:</label>
              <select
                value={part.unit}
                onChange={(e) => handlePartChange(index, "unit", e.target.value)}
                className="border p-2 rounded w-full bg-gray-300 mb-2"
              >
                {part.motionType === "LINEAR" ? (
                  <>
                    <option value="MM">MM</option>
                    <option value="CM">CM</option>
                    <option value="INCH">INCH</option>
                  </>
                ) : (
                  <>
                    <option value="DEG">Degrees</option>
                    <option value="RAD">Radians</option>
                  </>
                )}
              </select>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddPart}
            className="bg-green-500 text-white px-4 py-2 rounded-2xl font-semibold mb-4"
          >
            + Add Part
          </button>

          <button type="submit" className="w-full bg-orange-500 text-white px-6 py-3 rounded-2xl font-semibold">
            {loading ? "Saving..." : "Save Product"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateProject;
