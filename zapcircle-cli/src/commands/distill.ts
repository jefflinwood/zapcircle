import {
  readdirSync,
  existsSync,
  statSync,
  readFileSync,
  writeFileSync,
} from "fs";
import path from "path";
import toml from "@iarna/toml";

export async function distill(
  targetPath: string,
  options: { verbose?: boolean; output?: string; interactive?: boolean },
) {
  try {
    const outputDir = options.output || path.dirname(targetPath);

    // Load .gitignore and parse exclusions
    const gitignorePath = path.join(targetPath, ".gitignore");
    const ignoredPaths: string[] = [];
    ignoredPaths.push(path.join(targetPath, ".git"));
    if (existsSync(gitignorePath)) {
      const gitignoreContent = readFileSync(gitignorePath, "utf-8");
      gitignoreContent.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          ignoredPaths.push(path.join(targetPath, trimmed));
        }
      });
    }

    // Helper function to scan directory and collect files, excluding .gitignore paths
    const collectFiles = (currentPath: string): string[] => {
      let fileList: string[] = [];
      const files = readdirSync(currentPath);

      for (const file of files) {
        const filePath = path.join(currentPath, file);
        if (
          ignoredPaths.some((ignoredPath) => filePath.startsWith(ignoredPath))
        )
          continue;

        const stats = statSync(filePath);

        if (stats.isDirectory()) {
          fileList = fileList.concat(collectFiles(filePath));
        } else {
          fileList.push(filePath.replace(targetPath + path.sep, ""));
        }
      }
      return fileList;
    };

    // Detect framework based on package.json dependencies
    const detectFramework = (): string => {
      const packageJsonPath = path.join(targetPath, "package.json");
      if (!existsSync(packageJsonPath)) return "Unknown";

      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (dependencies["next"]) {
        return existsSync(path.join(targetPath, "pages"))
          ? "Next.js (Page Router)"
          : "Next.js (App Router)";
      }
      if (dependencies["remix"] || dependencies["@remix-run/react"])
        return "Remix";
      if (dependencies["react-router-dom"]) return "React Router";
      return "Unknown";
    };

    // Detect programming language (TypeScript or JavaScript)
    const detectLanguage = (): string => {
      const tsConfigPath = path.join(targetPath, "tsconfig.json");
      if (existsSync(tsConfigPath)) return "TypeScript";
      return "JavaScript";
    };

    // Detect test frameworks
    const detectTestFrameworks = (): string[] => {
      const testFrameworks: string[] = [];
      const packageJsonPath = path.join(targetPath, "package.json");
      if (!existsSync(packageJsonPath)) return testFrameworks;

      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (dependencies["jest"]) testFrameworks.push("Jest");
      if (dependencies["vitest"]) testFrameworks.push("Vitest");
      if (dependencies["mocha"]) testFrameworks.push("Mocha");
      if (dependencies["chai"]) testFrameworks.push("Chai");
      if (dependencies["cypress"]) testFrameworks.push("Cypress");
      if (dependencies["playwright"]) testFrameworks.push("Playwright");

      return testFrameworks;
    };

    // Extract metadata
    const framework = detectFramework();
    const files = collectFiles(targetPath);
    const language = detectLanguage();
    const testFrameworks = detectTestFrameworks();

    // Detect authentication providers
    const detectAuthProviders = (): string[] => {
      const authProviders: string[] = [];
      const packageJsonPath = path.join(targetPath, "package.json");
      if (!existsSync(packageJsonPath)) return authProviders;

      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (
        dependencies["@okta/okta-auth-js"] ||
        dependencies["@okta/okta-react"]
      )
        authProviders.push("Okta");
      if (
        dependencies["@auth0/auth0-react"] ||
        dependencies["@auth0/auth0-spa-js"]
      )
        authProviders.push("Auth0");
      if (dependencies["@supabase/supabase-js"]) authProviders.push("Supabase");
      if (
        dependencies["@clerk/clerk-react"] ||
        dependencies["@clerk/clerk-sdk-node"]
      )
        authProviders.push("Clerk");
      if (dependencies["next-auth"] || dependencies["auth.js"])
        authProviders.push("Auth.js");

      return authProviders;
    };

    // Detect UI component libraries
    const detectComponentLibraries = (): string[] => {
      const componentLibraries: string[] = [];
      const packageJsonPath = path.join(targetPath, "package.json");
      if (!existsSync(packageJsonPath)) return componentLibraries;

      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (dependencies["@shadcn/ui"]) componentLibraries.push("shadcn");
      if (dependencies["daisyui"]) componentLibraries.push("DaisyUI");
      if (dependencies["@mui/material"]) componentLibraries.push("MUI");
      if (dependencies["@chakra-ui/react"])
        componentLibraries.push("Chakra UI");
      if (dependencies["antd"]) componentLibraries.push("Ant Design");

      return componentLibraries;
    };

    const authProviders = detectAuthProviders();
    const componentLibraries = detectComponentLibraries();

    const tomlData = {
      project: { framework, language },
      files: { list: files },
      tests: { frameworks: testFrameworks },
      auth: { providers: authProviders },
      components: { libraries: componentLibraries },
    };

    const tomlContents = toml.stringify(tomlData);
    const outputFilePath = path.join(outputDir, "zapcircle.distill.toml");
    writeFileSync(outputFilePath, tomlContents);

    console.log(`Distill completed: ${outputFilePath}`);
  } catch (error) {
    console.error("Error running distill:", error);
  }
}
