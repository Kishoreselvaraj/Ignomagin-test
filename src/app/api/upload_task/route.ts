import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import csvParser from "csv-parser";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const prisma = new PrismaClient();
const writeFile = promisify(fs.writeFile);

// **GET Method: Fetch all tasks**
export async function GET() {
    try {
        const tasks = await prisma.task.findMany();
        return NextResponse.json(tasks, { status: 200 });
    } catch (error) {
        console.error("Fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}

// **POST Method: Upload CSV & Store in DB**
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
        const results = await new Promise<
            { taskName: string; pos1: string; pos2: string; speed: string; cycleCount: string; runTime: string; motion: string; part: string }[]
        >((resolve, reject) => {
            const data: any[] = [];
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on("data", (row) => data.push(row))
                .on("end", () => resolve(data))
                .on("error", (error) => reject(error));
        });

        // Insert tasks into MongoDB
        await prisma.task.createMany({
            data: results.map((row) => ({
                taskName: row.taskName,
                pos1: row.pos1,
                pos2: row.pos2,
                speed: row.speed,
                cycleCount: row.cycleCount,
                runTime: row.runTime,
                motion: row.motion,
                part: row.part,
            })),
        });

        // Delete file after processing
        fs.unlinkSync(filePath);

        return NextResponse.json({ message: "Tasks uploaded successfully" }, { status: 201 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to upload tasks" }, { status: 500 });
    }
}
