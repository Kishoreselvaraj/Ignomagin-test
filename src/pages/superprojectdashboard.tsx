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
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-sm text-gray-600">
                  Parts: {product.parts.length}
                </p>
                
                {product.parts.length > 0 && (
                  <ul className="mt-2 text-sm">
                    {product.parts.map((part) => (
                      <li key={part.id} className="border-t pt-1">
                        <span className="font-medium">{part.name}</span> 
                        ({part.motionType})
                        
                        {part.motionType === "LINEAR" && (
                          <p className="text-gray-700">
                            Pos1: {part.pos1} | Pos2: {part.pos2}
                          </p>
                        )}
                        {part.motionType === "LINEAR" && (
                          <p className="text-gray-700">
                            Unit: {part.unit}
                          </p>
                        )}

                        {part.motionType === "ROTARY" && (
                          <p className="text-gray-700">
                            Value: {part.value}
                          </p>
                        )}
                        {part.motionType === "ROTARY" && (
                          <p className="text-gray-700">
                            Unit: {part.unit}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
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
