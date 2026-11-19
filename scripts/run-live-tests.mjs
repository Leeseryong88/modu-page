import { spawn } from "node:child_process";
import { localEnv } from "./local-env.mjs";
const child = spawn(process.execPath, ["node_modules/vitest/vitest.mjs", "run", "tests/http.test.ts", "tests/inquiries-http.test.ts"], { env: localEnv, stdio: "inherit", windowsHide: true });
child.on("exit", code => process.exit(code || 0));
