interface Part {
  id?: string;
  name: string;
  motionType: string;
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

const ProductPreviewModal = ({ product, onClose }: { product: Product; onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>
            ✖
          </button>
          <h2 className="text-xl font-bold mb-2">{product.name}</h2>
          {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded" />}
          
          <h3 className="mt-4 text-lg font-semibold">Parts:</h3>
          {product.parts.length > 0 ? (
            <ul className="space-y-2">
              {product.parts.map((part, index) => (
                <li key={part.id || index} className="border p-2 rounded">
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
      </div>
    );
  };
  
  export default ProductPreviewModal;
  