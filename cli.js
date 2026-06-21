import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const projectName = process.argv[2];

if (!projectName) {
  console.log("Usage: node cli.mjs <project-name>");
  process.exit(1);
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

// 1. create expo app
run(`npx create-expo-app@latest ${projectName}`);

// 2. enter project
process.chdir(projectName);

// 3. reset (safe fallback)
try {
  run(`npm run reset-project`);
} catch {
  console.log("reset-project skipped");
}

// 4. scalable structure (feature-based)

const dirs = [
  "src",

  // routing layer (Expo Router safe zone)
  "src/app",

  // feature modules (scales horizontally)
  "src/features",
  "src/features/auth",
  "src/features/auth/screens",
  "src/features/auth/logic",
  "src/features/auth/api",

  "src/features/expenses",
  "src/features/expenses/screens",
  "src/features/expenses/logic",
  "src/features/expenses/api",

  // shared (only truly reusable stuff)
  "src/shared",
  "src/shared/ui",
  "src/shared/hooks",
  "src/shared/utils",
  "src/shared/constants",

  // app-level infrastructure
  "src/services",
  "src/types",
  "src/config"
];

dirs.forEach((dir) => {
  fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true });
});

console.log("Scalable Expo structure created.");