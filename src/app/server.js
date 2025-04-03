import { createServer } from "http";
import { app } from "electron";
import next from "next";
// import path from "path";

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer((req, res) => {
        handle(req, res);
    }).listen(3000, () => {
        console.log("Next.js server running on http://localhost:3000");
    });
});
