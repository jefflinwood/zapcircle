import fs from "fs";
import path from "path";

type BehaviorMetadata = {
  // Define the shape of any optional metadata you expect
  [key: string]: any;
};

function parseBehaviorFile(filePath: string): BehaviorMetadata | null {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    // Mock parsing logic, replace with actual parsing implementation
    const metadata: BehaviorMetadata = {}; // Populate metadata from fileContent
    return metadata;
  } catch (error) {
    return null;
  }
}

function fuzzyMatch(basename: string, behaviorBasename: string): boolean {
  return basename.toLowerCase() === behaviorBasename.toLowerCase();
}

export function findBehaviorForComponent(
  componentFilePath: string,
): string | undefined {
  const componentDir = path.dirname(componentFilePath);
  const componentBasename = path.basename(
    componentFilePath,
    path.extname(componentFilePath),
  );

  const behaviorFiles = fs
    .readdirSync(componentDir)
    .filter((file) => file.endsWith(".zap.toml"));

  for (const behaviorFile of behaviorFiles) {
    const behaviorBasename = path.basename(behaviorFile, ".zap.toml");

    if (fuzzyMatch(componentBasename, behaviorBasename)) {
      return path.join(componentDir, behaviorFile);
    }
  }

  return undefined;
}
