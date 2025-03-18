"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  id: string;
  name: string;
  imageUrl?: string;
  parts: Part[];
}

const Superproject = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null); // Track expanded product
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products");
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`/api/products?id=${id}`);
        setProducts((prev) => prev.filter((product) => product.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedProductId(expandedProductId === id ? null : id);
  };

  return (
    <div>
      <NavBar />
      <div className="w-3/4 p-6 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Product Dashboard</h1>

        {loading ? (
          <p className="text-gray-500">Loading products...</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer p-4 w-full"
              >
                {/* Clickable area to toggle preview */}
                <div
                  className="flex items-center"
                  onClick={() => toggleExpand(product.id)}
                >
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-32 h-32 object-contain rounded-lg mr-4"
                    />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    <p className="text-sm text-gray-600">
                      Parts: {product.parts.length}
                    </p>
                  </div>
                  <div className="ml-auto space-x-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents toggling when clicking edit
                        router.push(`/editproduct/${product.id}`);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(product.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Expanded Product Details */}
                {expandedProductId === product.id && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
                    <h3 className="text-lg font-bold">Product Details</h3>
                    <p><strong>Name:</strong> {product.name}</p>
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full max-w-xs h-auto object-contain rounded-lg mt-2"
                      />
                    )}

                    <h3 className="text-lg font-bold mt-4">Parts:</h3>
                    {product.parts.length > 0 ? (
                      <ul className="mt-2 space-y-2">
                        {product.parts.map((part) => (
                          <li
                            key={part.id}
                            className="border p-2 rounded-lg shadow-sm bg-gray-50"
                          >
                            <p><strong>Name:</strong> {part.name}</p>
                            <p><strong>Motion Type:</strong> {part.motionType}</p>
                            {part.pos1 !== undefined && <p>Position 1: {part.pos1}</p>}
                            {part.pos2 !== undefined && <p>Position 2: {part.pos2}</p>}
                            {part.value !== undefined && <p>Value: {part.value}</p>}
                            {part.unit && <p>Unit: {part.unit}</p>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No parts available.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => router.push("/createproject")}
          className="fixed bottom-28 right-6 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-orange-600 transition"
        >
          Add Product
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Superproject;
