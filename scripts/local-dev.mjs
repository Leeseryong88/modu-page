import { spawn } from "node:child_process";
import { localEnv } from "./local-env.mjs";
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", process.env.LOCAL_APP_PORT || "3000"], { env: localEnv, stdio: "inherit", windowsHide: true });
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
child.on("exit", code => process.exit(code || 0));
