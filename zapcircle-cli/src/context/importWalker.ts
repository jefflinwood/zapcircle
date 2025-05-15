import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { fileURLToPath } from "url";

const walkImports = async (
  entryFile: string,
  depthLimit: number = Infinity,
  visited: Set<string> = new Set(),
): Promise<string[]> => {
  if (depthLimit < 0) return [];

  const absolutePath = path.resolve(entryFile);
  if (visited.has(absolutePath)) return [];

  visited.add(absolutePath);

  const code = await fs.promises.readFile(absolutePath, "utf-8");
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["typescript"],
  });

  const localFiles: string[] = [];

  traverse(ast, {
    ImportDeclaration({ node }) {
      const importPath = node.source.value;
      if (!importPath.startsWith(".") || importPath.includes("node_modules"))
        return;

      const resolvedPath = path.resolve(path.dirname(absolutePath), importPath);
      localFiles.push(resolvedPath);
    },
  });

  for (const file of localFiles) {
    const nestedFiles = await walkImports(file, depthLimit - 1, visited);
    localFiles.push(...nestedFiles);
  }

  return localFiles;
};

export default walkImports;
