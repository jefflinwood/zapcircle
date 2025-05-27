import { execSync } from "child_process";
import path from "path";
import fs from "fs/promises";

export async function createBaseProjectWithVite(
  projectDir: string,
  verbose = true,
) {
  const fullPath = path.resolve(projectDir);
  const projectName = path.basename(fullPath);
  const parentDir = path.dirname(fullPath);

  const log = (msg: string) => {
    if (verbose) console.log(msg);
  };

  log(`📦 Creating base Vite + React + TS project at ${fullPath}...`);

  // Step 1: Create Vite project
  execSync(
    `npx create-vite@latest ${projectName} --template react-ts --no-git`,
    {
      cwd: parentDir,
      stdio: "inherit",
    },
  );

  // Step 2: Install dependencies
  execSync(`npm install`, {
    cwd: fullPath,
    stdio: "inherit",
  });

  // Step 3: Install Tailwind and plugin
  execSync(`npm install -D tailwindcss @tailwindcss/vite`, {
    cwd: fullPath,
    stdio: "inherit",
  });

  // Step 4: Overwrite index.css with Tailwind @import
  const indexCssPath = path.join(fullPath, "src", "index.css");
  const tailwindCss = `@import "tailwindcss";\n`;
  await fs.writeFile(indexCssPath, tailwindCss);
  log("🎨 Tailwind import added to index.css");

  // Step 5: Modify vite.config.ts to use Tailwind plugin
  const viteConfigPath = path.join(fullPath, "vite.config.ts");
  const viteConfigContent = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`.trimStart();
  await fs.writeFile(viteConfigPath, viteConfigContent);
  log("⚙️ vite.config.ts updated to use Tailwind plugin");

  // Step 6: Install React Router
  execSync(`npm install react-router-dom`, {
    cwd: fullPath,
    stdio: "inherit",
  });

  // Step 7: Inject Tailwind CSS link into index.html
  const indexHtmlPath = path.join(fullPath, "index.html");
  let html = await fs.readFile(indexHtmlPath, "utf-8");

  if (!html.includes("/src/index.css")) {
    html = html.replace(
      /<\/head>/,
      `  <link href="/src/index.css" rel="stylesheet">\n</head>`,
    );
    await fs.writeFile(indexHtmlPath, html);
    log("🧩 Injected /src/index.css link into index.html");
  }

  log("🧱 Installed Tailwind CSS (v4.1+) and React Router");
}
