import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Handle CORS for OPTIONS requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

// ✅ Create (POST) Task
export async function POST(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const contentType = req.headers.get("content-type");

    if (contentType !== "application/json") {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400, headers }
      );
    }

    // ✅ Handle empty or malformed JSON
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      console.error("Failed to parse JSON:", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400, headers }
      );
    }

    // ✅ Check if body is null or empty
    if (!body || Object.keys(body).length === 0) {
      console.error("Empty or null payload received.");
      return NextResponse.json(
        { error: "Empty or invalid payload" },
        { status: 400, headers }
      );
    }

    const {
      taskName = "Untitled Task",
      productId = "",
      part = "Unknown Part",
      pos1 = 0,
      pos2 = 0,
      posUnit = "mm",
      speed = 0,
      speedUnit = "M/S",
      cycleCount = 0,
      totalCycleCount = 0,
      runTime = 0,
      totalRunTime = 0,
      restTime = 0,
      motionType = "Linear",
      testMethod = "standard"
    } = body;

    // ✅ Validate fields and their types
    if (
      !taskName || !productId || !part ||
      pos1 == null || pos2 == null || speed == null ||
      cycleCount == null || totalCycleCount == null ||
      runTime == null || totalRunTime == null || !motionType
    ) {
      console.error("Missing or invalid fields.");
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400, headers }
      );
    }

    // ✅ Prisma task creation
    const newTask = await prisma.task.create({
      data: {
        cycleCount: parseInt(body.cycleCount),          // ✅ Int
        motionType: body.motionType,                    // ✅ String
        part: body.part,                                // ✅ String
        pos1: parseFloat(body.pos1),                    // ✅ Float
        pos2: parseFloat(body.pos2),                    // ✅ Float
        posUnit: body.posUnit,                          // ✅ String (degrees, mm, etc.)
        productId: body.productId,                      // ✅ String UUID
        restTime: parseFloat(body.restTime),              // ✅ Int
        runTime: parseFloat(body.runTime),                // ✅ Int
        speed: parseFloat(body.speed),                  // ✅ Float
        speedUnit: body.speedUnit,                      // ✅ Ensure speedUnit is of type SpeedUnit
        taskName: body.taskName,                        // ✅ String
        testMethod: body.testMethod,                    // ✅ String
        totalCycleCount: parseInt(body.totalCycleCount),// ✅ Int
        totalRunTime: parseFloat(body.totalRunTime)       // ✅ Int
      }
    });
    
    
    console.log("Task created:", newTask);
    return NextResponse.json(newTask, { status: 201, headers });

  } catch (error: any) {
    console.error("Prisma Error:", error);
  
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Duplicate record conflict" },
          { status: 409, headers }
        );
      }
      // Handle other known Prisma error codes
      return NextResponse.json(
        { error: `Database error: ${error.code}`, message: error.message },
        { status: 400, headers }
      );
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      // Handle validation errors (wrong types, missing required fields)
      return NextResponse.json(
        { error: "Validation error", message: error.message },
        { status: 400, headers }
      );
    } else {
      // Generic error handler
      return NextResponse.json(
        { error: "Internal server error", message: error.message },
        { status: 500, headers }
      );
    }
  }
}
//     return NextResponse.json(
//       { error: error.message || "Error creating task" },
//       { status: 500, headers }
//     );
//   }
// }

// ✅ Read (GET) All Tasks
export async function GET() {
  try {
    const tasks = await prisma.task.findMany();

    return NextResponse.json(tasks, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Error fetching tasks" },
      { status: 500 }
    );
  }
}

// ✅ Update (PUT) Task by ID

// Enum validation
const POS_UNITS = ["MM", "CM", "M", "KM"];
const SPEED_UNITS = ["MS", "KMH"];
const MOTION_TYPES = ["ROTARY", "LINEAR", "OSCILLATING"];
const TEST_METHODS = ["manual", "automatic", "standard"];

export async function PUT(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type");

    if (contentType !== "application/json") {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Empty or invalid payload" }, { status: 400 });
    }

    const { id, ...data } = body;

    if (!id || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Missing ID or data" }, { status: 400 });
    }

    // 🔥 Validate the enum fields
    if (data.posUnit && !POS_UNITS.includes(data.posUnit)) {
      return NextResponse.json({ error: "Invalid posUnit" }, { status: 400 });
    }

    if (data.speedUnit && !SPEED_UNITS.includes(data.speedUnit)) {
      return NextResponse.json({ error: "Invalid speedUnit" }, { status: 400 });
    }

    if (data.motionType && !MOTION_TYPES.includes(data.motionType)) {
      return NextResponse.json({ error: "Invalid motionType" }, { status: 400 });
    }

    if (data.testMethod && !TEST_METHODS.includes(data.testMethod)) {
      return NextResponse.json({ error: "Invalid testMethod" }, { status: 400 });
    }

    // Ensure the task with the given ID exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // 🌟 Set defaults for optional fields
    const updatedData = {
      ...data,
      restTime: data.restTime ?? 0,
      testMethod: data.testMethod ?? "standard",
    };

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(updatedTask, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error updating task:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors (e.g., unique constraint violations)
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      // Handle other unexpected errors
      return NextResponse.json({ error: "Error updating task" }, { status: 500 });
    }
  }
}


// ✅ Delete (DELETE) Task by ID
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing task ID" },
        { status: 400 }
      );
    }

    await prisma.task.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Error deleting task" },
      { status: 500 }
    );
  }
}
