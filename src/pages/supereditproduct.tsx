"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

interface Part {
  id: string;
  name: string;
  motionType: "LINEAR" | "ROTARY";
  pos1?: number;
  pos2?: number;
  value?: number;
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

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/api/products?id=${productId}`);
      setProduct(res.data);
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
    setProduct({ ...product, parts: updatedParts });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
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

  return (
    <div className="bg-gray-100 min-h-screen">
      <NavBar />
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Product</h1>

        {error && <p className="text-red-500 bg-red-100 p-2 rounded">{error}</p>}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-lg font-semibold text-gray-700">Product Name:</label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleProductChange}
                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-lg font-semibold text-gray-700">Upload New Image:</label>
              <input type="file" onChange={handleImageUpload} className="w-full p-2 border rounded-lg" />
              {imageFile && <p className="text-sm text-gray-600">Selected: {imageFile.name}</p>}
            </div>

            {/* Parts Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Parts:</h2>
              {product.parts.length > 0 ? (
                product.parts.map((part, index) => (
                  <div key={part.id || index} className="border p-4 rounded-lg shadow-md bg-gray-50 mb-4">
                    <label className="block text-sm font-semibold">Name:</label>
                    <input
                      type="text"
                      value={part.name}
                      onChange={(e) => handlePartChange(index, "name", e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                    />

                    <label className="block text-sm font-semibold">Motion Type:</label>
                    <select
                      value={part.motionType}
                      onChange={(e) => handlePartChange(index, "motionType", e.target.value as "LINEAR" | "ROTARY")}
                      className="w-full p-2 border rounded mb-2"
                    >
                      <option value="LINEAR">LINEAR</option>
                      <option value="ROTARY">ROTARY</option>
                    </select>

                    {part.pos1 !== undefined && (
                      <>
                        <label className="block text-sm font-semibold">Position 1:</label>
                        <input
                          type="number"
                          value={part.pos1}
                          onChange={(e) => handlePartChange(index, "pos1", Number(e.target.value))}
                          className="w-full p-2 border rounded mb-2"
                        />
                      </>
                    )}

                    {part.pos2 !== undefined && (
                      <>
                        <label className="block text-sm font-semibold">Position 2:</label>
                        <input
                          type="number"
                          value={part.pos2}
                          onChange={(e) => handlePartChange(index, "pos2", Number(e.target.value))}
                          className="w-full p-2 border rounded mb-2"
                        />
                      </>
                    )}

                    {part.value !== undefined && (
                      <>
                        <label className="block text-sm font-semibold">Value:</label>
                        <input
                          type="number"
                          value={part.value}
                          onChange={(e) => handlePartChange(index, "value", Number(e.target.value))}
                          className="w-full p-2 border rounded mb-2"
                        />
                      </>
                    )}

                    {part.unit && (
                      <>
                        <label className="block text-sm font-semibold">Unit:</label>
                        <input
                          type="text"
                          value={part.unit}
                          onChange={(e) => handlePartChange(index, "unit", e.target.value)}
                          className="w-full p-2 border rounded mb-2"
                        />
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No parts available.</p>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 rounded-lg shadow">
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
