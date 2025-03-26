// File: /app/api/product/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// 🟢 GET - Fetch All Products or a Single Product with Parts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // Fetch by product ID

  try {
    if (id) {
      // Fetch a single product with its parts
      const product = await prisma.product.findUnique({
        where: { id },
        include: { parts: true }, // Include associated parts
      });

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      return NextResponse.json(product);
    }

    // Fetch all products with their parts
    const products = await prisma.product.findMany({ include: { parts: true } });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching product(s):", error);
    return NextResponse.json({ error: "Error fetching product(s)" }, { status: 500 });
  }
}

// 🟢 POST - Create a New Product with Image Upload
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const image = formData.get("image");

    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    let imageUrl = null;

    // Handle image upload
    if (image && image instanceof Blob) {
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${image.name}`;
      const filePath = path.join(uploadDir, fileName);

      const buffer = await image.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));

      imageUrl = `/uploads/${fileName}`;
    }

    // Create the product in the database
    const product = await prisma.product.create({
      data: { name, imageUrl },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Error creating product" }, { status: 500 });
  }
}

// 🟢 PUT - Update Product Name
export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }
  
  try {
    const productData = await req.json();
    const { name, imageUrl, parts } = productData;
    
    // Start a transaction to update both product and parts
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Update the product
      await prisma.product.update({
        where: { id },
        data: { 
          name,
          imageUrl 
        },
      });
      
      // 2. Handle parts updates - first get existing parts
      const existingParts = await prisma.part.findMany({
        where: { productId: id }
      });
      
      // Create a map of existing part IDs for easier reference
      const existingPartIds = new Set(existingParts.map(part => part.id));
      
      // Process parts if they exist in the request
      if (Array.isArray(parts)) {
        // Track which parts we've processed
        const processedPartIds = new Set();
        
        // Update or create each part
        for (const part of parts) {
          if (part.id && existingPartIds.has(part.id)) {
            // Update existing part
            await prisma.part.update({
              where: { id: part.id },
              data: {
                name: part.name,
                motionType: part.motionType,
                pos1: part.pos1 !== undefined ? Number(part.pos1) : null,
                pos2: part.pos2 !== undefined ? Number(part.pos2) : null,
                speed: part.speed !== undefined ? Number(part.speed) : null,
                unit: part.unit
              }
            });
            
            // Mark as processed
            processedPartIds.add(part.id);
          } else {
            // Create new part
            await prisma.part.create({
              data: {
                productId: id,
                name: part.name,
                motionType: part.motionType,
                pos1: part.pos1 !== undefined ? Number(part.pos1) : null,
                pos2: part.pos2 !== undefined ? Number(part.pos2) : null,
                speed: part.speed !== undefined ? Number(part.speed) : null,
                unit: part.unit
              }
            });
          }
        }
        
        // Delete parts that weren't in the update request
        for (const existingPart of existingParts) {
          if (!processedPartIds.has(existingPart.id)) {
            await prisma.part.delete({
              where: { id: existingPart.id }
            });
          }
        }
      }
      
      // Return the updated product with its parts
      return prisma.product.findUnique({
        where: { id },
        include: { parts: true }
      });
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Error updating product" }, { status: 500 });
  }
}


// 🟢 DELETE - Remove a Product and Its Associated Parts
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  try {
    // Delete all parts associated with the product
    await prisma.part.deleteMany({ where: { productId: id } });

    // Delete the product
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Product and associated parts deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Error deleting product" }, { status: 500 });
  }
}