"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { ArrowLeft } from "lucide-react";

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
  const { id } = useParams() as { id?: string };
  const router = useRouter();
  const [product, setProduct] = useState<Product>({ name: "", parts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/api/products?id=${productId}`);
      setProduct(res.data);
      setImagePreview(res.data.imageUrl || null);
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

  const handlePartChange = (index: number, key: keyof Part, value: any) => {
    const updatedParts = product.parts.map((part, i) =>
      i === index ? { ...part, [key]: value } : part
    );

    // Automatically update the unit based on motion type
    if (key === "motionType") {
      updatedParts[index].unit = value === "LINEAR" ? "mm" : "degrees";
    }

    setProduct({ ...product, parts: updatedParts });
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
      let updatedProduct = { ...product };

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await axios.post("/api/upload", formData);
        updatedProduct.imageUrl = uploadRes.data.url;
      }

      await axios.put(`/api/products?id=${id}`, updatedProduct);
      alert("Product updated successfully!");
      router.push("/productdashboard");
    } catch (err) {
      setError("Error updating product.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic unit options based on motion type
  const getUnitOptions = (motionType: "LINEAR" | "ROTARY") => {
    return motionType === "LINEAR"
      ? ["mm", "cm", "m"]
      : ["degrees", "radians", "rev/min"];
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

        {error && <p className="text-red-500 bg-red-100 p-2 rounded">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Product Name */}
            <div>
              <label className="block text-lg font-semibold">Product Name:</label>
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
              <label className="block text-lg font-semibold">Upload New Image:</label>
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
                  <img
                    src={imagePreview}
                    alt="Product Preview"
                    className="w-48 h-48 object-cover rounded-lg shadow"
                  />
                </div>
              )}
            </div>

            {/* Parts Section */}
            <div>
              <h2 className="text-xl font-semibold">Parts:</h2>
              {product.parts.map((part, index) => (
                <div key={part.id || index} className="border p-4 rounded-lg bg-gray-50 mb-6">
                  <label className="block font-semibold">Part Name:</label>
                  <input
                    type="text"
                    value={part.name}
                    onChange={(e) => handlePartChange(index, "name", e.target.value)}
                    className="w-full p-2 border rounded-lg mb-4"
                  />
                  <div>
                      <label className="block font-semibold">Motion Type:</label>
                      <select
                        value={part.motionType}
                        onChange={(e) =>
                          handlePartChange(index, "motionType", e.target.value as "LINEAR" | "ROTARY")
                        }
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="LINEAR">LINEAR</option>
                        <option value="ROTARY">ROTARY</option>
                      </select>
                    </div>
                  {/* Motion Type, Pos1, Pos2, and Unit in the same row */}
                  <div className="grid grid-cols-4 gap-4">
                    
                    {/* Motion Type */}
                    

                    {/* Position Fields */}
                    <div>
                      <label className="block font-semibold">Pos 1:</label>
                      <input
                        type="number"
                        value={part.pos1 || ""}
                        placeholder="0"
                        onChange={(e) => handlePartChange(index, "pos1", Number(e.target.value))}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold">Pos 2:</label>
                      <input
                        type="number"
                        value={part.pos2 || ""}
                        placeholder="0" 
                        onChange={(e) => handlePartChange(index, "pos2", Number(e.target.value))}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block font-semibold">Unit:</label>
                      <select
                        value={part.unit || ""}
                        onChange={(e) => handlePartChange(index, "unit", e.target.value)}
                        className="w-full p-2 border rounded-lg"
                      >
                        {getUnitOptions(part.motionType).map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                      <label className="block font-semibold">Speed:</label>
                      <input
                        type="number"
                        value={part.speed || ""}
                        onChange={(e) => handlePartChange(index, "speed", Number(e.target.value))}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                </div>
              ))}
            </div>

            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg shadow-lg">
              Save Changes
            </button>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default EditProduct;
