// pages/api/taskcsv/route.ts
import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const csvFilePath = path.join(process.cwd(), 'data', 'hardware_settings.csv');
let status: string = 'STOPPED'; // This should be set based on your application logic
// ✅ Ensure the CSV file exists
const ensureFileExists = () => {
  if (!fs.existsSync(path.dirname(csvFilePath))) {
    fs.mkdirSync(path.dirname(csvFilePath), { recursive: true });
  }

  if (!fs.existsSync(csvFilePath)) {
    const defaultContent = `Setting,Value\nJOINT,Part 1\nSPEED,0\nSTART_POS,0\nEND_POS,0\nR_STATUS,STOP\nC2COMPLETE,0\nCC_COMPLETE,0\nJogging,0\n`;
    fs.writeFileSync(csvFilePath, defaultContent);
  }
};

// ✅ OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// ✅ POST handler to update CSV
export async function POST(req: NextRequest) {
  try {
    const { action, task } = await req.json();
    console.log('task', task.jogging);
    ensureFileExists();

    let csvContent = `Setting,Value\n`;
    csvContent += `JOINT,${task.part || 'Part 1'}\n`;
    csvContent += `SPEED,${task.speed || '0'}\n`;
    csvContent += `START_POS,${task.pos1 || '0'}\n`;
    csvContent += `END_POS,${task.pos2 || '0'}\n`;
    csvContent += `R_STATUS,${action || 'STOP'}\n`;
    csvContent += `C2COMPLETE,${task.totalCycle || '0'}\n`;
    csvContent += `CC_COMPLETE,${task.currentCycle || '0'}\n`;
    csvContent += `Jogging,${task.jogging || '0'}\n`;

    await fs.promises.writeFile(csvFilePath, csvContent);
    status = action === 'running' ? 'RUNNING' : 'STOPPED';
    return new NextResponse(JSON.stringify({ message: 'CSV updated successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error writing to CSV:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update CSV' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// ✅ GET handler to stream only the CC_COMPLETE value
export async function GET() {
  ensureFileExists();

  // ✅ Properly initialize the stream before referencing it
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        try {
          // Read and parse the CSV
          const content = fs.readFileSync(csvFilePath, 'utf-8');
          const lines = content.split('\n');

          // Extract the CC_COMPLETE value and trim spaces
          const ccCompleteLine = lines.find(line => line.startsWith('CC_COMPLETE'));
          
          let ccCompleteValue = '0';
          if (ccCompleteLine) {
            const parts = ccCompleteLine.split(',');

            // Ensure value exists and trim any spaces
            if (parts.length > 1) {
              ccCompleteValue = parts[1].trim();
            }
          }

          // Send the value to the client
          if (status === 'RUNNING') {
            controller.enqueue(new TextEncoder().encode(`data: ${ccCompleteValue}\n\n`));
          }
          
        } catch (error) {
          console.error('Error reading CSV:', error);
          // controller.enqueue(new TextEncoder().encode(`data: ERROR\n\n`));
        }
      }, 1000); // Send updates every second

      // ✅ Properly handle client disconnect
      const cancel = () => {
        clearInterval(interval);
        controller.close();
      };

      // Add the cancel function to the stream
      this.cancel = cancel;
    }
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}