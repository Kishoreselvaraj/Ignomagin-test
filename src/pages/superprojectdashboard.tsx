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
  parts: Part[];
}

const Superproject = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products"); // Prisma API
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <NavBar />
      <div className="p-6 h-screen">
        <h1 className="text-2xl font-bold mb-4">Product Dashboard</h1>

        {loading ? (
          <p className="text-gray-500">Loading products...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-4 bg-gray-100 rounded-lg shadow"
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
          className="fixed bottom-28 right-6 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg"
        >
          + Create Product
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Superproject;
