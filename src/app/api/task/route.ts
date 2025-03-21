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
  try {
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type"
    });

    const contentType = req.headers.get("content-type");

    if (contentType !== "application/json") {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400, headers }
      );
    }

    const body = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "Empty or invalid payload" },
        { status: 400, headers }
      );
    }

    const {
      taskName,
      productId,
      part,
      pos1,
      pos2,
      posUnit,
      speed,
      speedUnit,
      cycleCount,
      totalCycleCount,
      runTime,
      totalRunTime,
      restTime,
      motionType,
      testMethod
    } = body;

    // ✅ Validation
    if (
      !taskName || !productId || !part || 
      pos1 == null || pos2 == null || speed == null || 
      cycleCount == null || totalCycleCount == null || 
      runTime == null || totalRunTime == null || !motionType
    ) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400, headers }
      );
    }

    // ✅ Create task in Prisma
    const newTask = await prisma.task.create({
      data: {
        taskName,
        productId,
        part,
        pos1: parseFloat(pos1),
        pos2: parseFloat(pos2),
        posUnit,
        speed: parseFloat(speed),
        speedUnit,
        cycleCount: parseInt(cycleCount),
        totalCycleCount: parseInt(totalCycleCount),
        runTime: parseFloat(runTime),
        totalRunTime: parseFloat(totalRunTime),
        restTime,
        motionType,
        testMethod,
      }
    });

    return NextResponse.json(newTask, { status: 201, headers });

  } catch (error: any) {
    console.log("Prisma Error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Duplicate record conflict" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: error.message || "Error creating task" },
      { status: 500 }
    );
  }
}

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
export async function PUT(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type");

    if (contentType !== "application/json") {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Missing ID or data" },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data
    });

    return NextResponse.json(updatedTask, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Error updating task" },
      { status: 500 }
    );
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
