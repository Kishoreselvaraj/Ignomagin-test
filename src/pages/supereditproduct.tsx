"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

interface Part {
  id: string;
  name: string;
  motionType: "LINEAR" | "ROTARY";
  pos1?: number;
  pos2?: number;
  speed?: number;
  unit?: string;
}

interface Product {
  name: string;
  imageUrl?: string;
  parts: Part[];
}

const EditProduct = () => {
  const params = useParams() || {};
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const router = useRouter();
  const [product, setProduct] = useState<Product>({ name: "", parts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchProduct(id as string);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/api/products?id=${productId}`);
      // Ensure parts data is properly formatted
      const fetchedProduct = res.data;

      // Make sure parts is an array (defensive programming)
      if (!Array.isArray(fetchedProduct.parts)) {
        fetchedProduct.parts = [];
      }

      setProduct(fetchedProduct);
      setImagePreview(fetchedProduct.imageUrl || null);
      console.log("Fetched product:", fetchedProduct); // Debug log
    } catch (err) {
      setError("Error fetching product details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handlePartChange = (
    index: number,
    key: keyof Part,
    value: number | string | undefined
  ) => {
    const updatedParts = [...product.parts]; // Create a new array to ensure React detects the change

    // If the part doesn't exist yet, initialize it
    if (!updatedParts[index]) {
      updatedParts[index] = {
        id: `temp-${index}`,
        name: "",
        motionType: "LINEAR",
      };
    }

    // Update the specific field
    updatedParts[index] = { ...updatedParts[index], [key]: value };

    // Automatically update the unit based on motion type
    if (key === "motionType") {
      updatedParts[index].unit = value === "LINEAR" ? "MM" : "DEG";
    }

    // Update product with new parts array
    setProduct({ ...product, parts: updatedParts });
  };

  const handleAddPart = () => {
    const newPart: Part = {
      id: `temp-${Date.now()}`, // Temporary ID to be replaced by server
      name: "New Part",
      motionType: "LINEAR",
      unit: "mm", // Default unit for LINEAR
    };

    setProduct({
      ...product,
      parts: [...product.parts, newPart],
    });
  };

  const handleRemovePart = (index: number) => {
    const updatedParts = [...product.parts];
    updatedParts.splice(index, 1); // Remove the part at specified index

    setProduct({
      ...product,
      parts: updatedParts,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) {
      setError("Product ID is missing in the URL.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Create a deep copy to avoid reference issues
      const updatedProduct = JSON.parse(JSON.stringify(product));

      // Ensure all part values are in the correct format before submission
      updatedProduct.parts = updatedProduct.parts.map((part: Part) => ({
        ...part,
        pos1: part.pos1 !== undefined ? Number(part.pos1) : undefined,
        pos2: part.pos2 !== undefined ? Number(part.pos2) : undefined,
        speed: part.speed !== undefined ? Number(part.speed) : undefined,
      }));

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await axios.post("/api/upload", formData);
        updatedProduct.imageUrl = uploadRes.data.url;
      }

      console.log("Submitting product update:", updatedProduct); // Debug log

      // Make the API call to update the product
      const response = await axios.put(
        `/api/products?id=${id}`,
        updatedProduct
      );
      console.log("Update response:", response.data); // Debug log

      alert("Product updated successfully!");
      router.push("/productdashboard");
    } catch (err) {
      setError("Error updating product.");
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic unit options based on motion type
  const getUnitOptions = (motionType: "LINEAR" | "ROTARY") => {
    return motionType === "LINEAR"
      ? ["MM", "CM", "M"]
      : ["DEG", "RAD"];
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50">
        <NavBar />
      </div>

      <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-lg font-semibold text-orange-600 hover:text-orange-800"
        >
          <ArrowLeft className="mr-2" /> Back
        </button>

        <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>

        {error && (
          <p className="text-red-500 bg-red-100 p-2 rounded">{error}</p>
        )}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Name */}
            <div>
              <label className="block text-lg font-semibold">
                Product Name:
              </label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleProductChange}
                className="w-full p-3 border rounded-lg focus:ring focus:ring-orange-300"
              />
            </div>

            {/* Image Upload & Preview */}
            <div>
              <label className="block text-lg font-semibold">
                Upload New Image:
              </label>
              <div
                className="border-2 border-dashed border-orange-400 rounded-lg p-4 text-center cursor-pointer bg-orange-50 hover:bg-orange-100"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  Drag & Drop or Click to Upload
                </label>
              </div>

              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Current Image:</p>
                  <Image
                    src={imagePreview}
                    alt="Product Preview"
                    width={192} // 48 * 4 (Tailwind w-48 = 192px)
                    height={192} // 48 * 4 (Tailwind h-48 = 192px)
                    className="object-cover rounded-lg shadow"
                  />
                </div>
              )}
            </div>

            {/* Parts Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Parts:</h2>
                <button
                  type="button"
                  onClick={handleAddPart}
                  className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  <Plus size={16} className="mr-2" /> Add Part
                </button>
              </div>

              {product.parts.length === 0 ? (
                <p className="text-gray-500 italic text-center py-4 border border-dashed rounded-lg">
                  No parts added yet. Click "Add Part" to get started.
                </p>
              ) : (
                product.parts.map((part, index) => (
                  <div
                    key={part.id || index}
                    className="border p-4 rounded-lg bg-gray-50 mb-6 relative"
                  >
                    {/* Remove Part Button */}
                    <button
                      type="button"
                      onClick={() => handleRemovePart(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      title="Remove Part"
                    >
                      <Trash2 size={18} />
                    </button>

                    <label className="block font-semibold">Part Name:</label>
                    <input
                      type="text"
                      value={part.name}
                      onChange={(e) =>
                        handlePartChange(index, "name", e.target.value)
                      }
                      className="w-full p-2 border rounded-lg mb-4"
                    />

                    <label className="block font-semibold">Motion Type:</label>
                    <select
                      value={part.motionType}
                      onChange={(e) =>
                        handlePartChange(
                          index,
                          "motionType",
                          e.target.value as "LINEAR" | "ROTARY"
                        )
                      }
                      className="w-full p-2 border rounded-lg mb-4"
                    >
                      <option value="LINEAR">LINEAR</option>
                      <option value="ROTARY">ROTARY</option>
                    </select>

                    {/* Motion Type, Pos1, Pos2, and Unit in the same row */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      {/* Position Fields */}
                      <div>
                        <label className="block font-semibold">Pos 1:</label>
                        <input
                          type="number"
                          value={part.pos1 !== undefined ? part.pos1 : ""}
                          placeholder="0"
                          onChange={(e) =>
                            handlePartChange(
                              index,
                              "pos1",
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold">Pos 2:</label>
                        <input
                          type="number"
                          value={part.pos2 !== undefined ? part.pos2 : ""}
                          placeholder="0"
                          onChange={(e) =>
                            handlePartChange(
                              index,
                              "pos2",
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>

                      {/* Unit */}
                      <div>
                        <label className="block font-semibold">Unit:</label>
                        <select
                          value={part.unit || ""}
                          onChange={(e) =>
                            handlePartChange(index, "unit", e.target.value)
                          }
                          className="w-full p-2 border rounded-lg"
                        >
                          {getUnitOptions(part.motionType).map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold">Speed:</label>
                        <input
                          type="number"
                          value={part.speed !== undefined ? part.speed : ""}
                          placeholder="0"
                          onChange={(e) =>
                            handlePartChange(
                              index,
                              "speed",
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default EditProduct;
