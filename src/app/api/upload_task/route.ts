import { NextResponse, NextRequest } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import csvParser from "csv-parser";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const prisma = new PrismaClient();
const writeFile = promisify(fs.writeFile);

interface CsvTask {
  taskName: string;
  pos1: string;
  pos2: string;
  speed: string;
  cycleCount: string;
  runTime: string;
  motion: string;
  part: string;
  testMethod?: string;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

        // Convert file to buffer
        const bytes = await (file as Blob).arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        // Save file locally
        const filePath = path.join(uploadDir, (file as File).name);
        await writeFile(filePath, buffer);

        // Read and parse CSV file
        const results = await new Promise<CsvTask[]>((resolve, reject) => {
            const data: CsvTask[] = [];
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on("data", (row: CsvTask) => data.push(row))
                .on("end", () => resolve(data))
                .on("error", (error) => reject(error));
        });

        // Map CSV data to Prisma model
        const formattedResults: Prisma.TaskCreateManyInput[] = results.map((task) => ({
            taskName: task.taskName,
            cycleCount: parseInt(task.cycleCount) || 0,         // Convert string to int
            pos1: parseFloat(task.pos1) || 0,                   // Convert string to float
            pos2: parseFloat(task.pos2) || 0,
            speed: parseFloat(task.speed) || 0,
            speedUnit: "MS",                                     // Set default speed unit (Meters/Second)
            posUnit: "MM",                                       // Default to Millimeters
            motionType: task.motion.toUpperCase() || "LINEAR",   // Map motion type
            productId: `product-${Date.now()}`,                  // Generate product ID placeholder
            restTime: Math.floor(Math.random() * 100),           // Mock rest time
            runTime: parseInt(task.runTime) || 0,                // Convert to int
            part: task.part,
            testMethod: task.testMethod || "default",            // Add testMethod with default
            totalCycleCount: parseInt(task.cycleCount) || 0,     // Map totalCycleCount
            totalRunTime: parseFloat(task.runTime) || 0,         // Map totalRunTime
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        // Insert tasks into MongoDB
        await prisma.task.createMany({
            data: formattedResults,
        });

        // Delete file after processing
        fs.unlinkSync(filePath);

        return NextResponse.json({ message: "Tasks uploaded successfully" }, { status: 201 });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to upload tasks" }, { status: 500 });
    }
}
