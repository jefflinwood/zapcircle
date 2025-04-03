import { readFileSync } from "fs";
import path from "path";
import toml from "@iarna/toml";
import { writeOutputFile } from "../../utils/writeOutputFile";

type ComponentDefinition = {
  name: string;
  role: string;
  behavior?: string;
};
export async function scaffoldBehaviorsFromProject(
    projectFilePath: string,
    options: { interactive?: boolean; output?: string; verbose?: boolean } = {},
  ) {
    try {
      const projectFileContents = readFileSync(projectFilePath, "utf-8");
      const projectToml = toml.parse(projectFileContents) as any;
  
      const components = projectToml.components || [];
      const outputDir = options.output || path.dirname(projectFilePath);
      const isInteractive = options.interactive || false;
  
      const behaviorFiles: string[] = [];
  
      for (const component of components as ComponentDefinition[]) {
        const componentName = component.name;
        const behavior = component.behavior || component.role;
        const tomlContent = `name = "${componentName}"\n\nbehavior = """\n${behavior.trim()}\n"""\n`;
  
        const outputFileName = `${componentName}.tsx.zap.toml`;
        const outputPath = path.join(outputDir, outputFileName);
        writeOutputFile(outputPath, tomlContent, isInteractive);
        behaviorFiles.push(outputFileName);
      }
  
      console.log(`✅ Behavior files created:\n${behaviorFiles.join("\n")}`);
    } catch (error) {
      console.error("Error scaffolding behaviors from project:", error);
    }
  }