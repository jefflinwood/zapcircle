import * as path from "path";
import * as babel from "@babel/parser";
import traverse from "@babel/traverse";
import { globSync } from "glob";

import { readFile, pathExists } from "../utils/platformUtils";

export function findComponentUsages(componentName: string): string[] {
  const usageFiles: string[] = [];

  const files = globSync("src/**/*.{js,jsx,ts,tsx}", {
    absolute: true,
    nodir: true,
  });

  for (const file of files) {
    if (!pathExists(file)) continue;

    const content = readFile(file);
    let ast;

    try {
      ast = babel.parse(content, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
      });
    } catch {
      continue;
    }

    let aliases: string[] = [];

    traverse(ast, {
      ImportDeclaration(path) {
        const basename = path.node.source.value
          .split("/")
          .pop()
          ?.replace(/\.[jt]sx?$/, "");

        path.node.specifiers.forEach((specifier) => {
          let importedName: string | undefined;
          let localName: string;

          if (specifier.type === "ImportSpecifier") {
            importedName =
              specifier.imported.type === "Identifier"
                ? specifier.imported.name
                : undefined;
            localName = specifier.local.name;
          } else if (specifier.type === "ImportDefaultSpecifier") {
            // Default import
            importedName = undefined;
            localName = specifier.local.name;
          } else if (specifier.type === "ImportNamespaceSpecifier") {
            // import * as Foo from ...
            importedName = undefined;
            localName = specifier.local.name;
          } else {
            return;
          }

          if (
            importedName === componentName ||
            localName === componentName ||
            basename === componentName
          ) {
            aliases.push(localName);
          }
        });
      },

      JSXOpeningElement(path) {
        if (
          path.node.name.type === "JSXIdentifier" &&
          aliases.includes(path.node.name.name)
        ) {
          usageFiles.push(file);
        }
      },

      CallExpression(path) {
        if (
          path.node.callee.type === "Identifier" &&
          aliases.includes(path.node.callee.name)
        ) {
          usageFiles.push(file);
        }
      },
    });
  }

  return [...new Set(usageFiles)];
}
