import { findComponentUsages } from "./findComponentUsages";
import * as platformUtils from "../utils/platformUtils";
import * as glob from "glob";

// Mock file contents
const fakeFiles: Record<string, string> = {
  "/project/src/ComponentDirect.tsx": `
    import LoginForm from './LoginForm';
    const Page = () => <LoginForm />;
  `,
  "/project/src/ComponentAliased.tsx": `
    import LF from './LoginForm';
    function Page() { return <LF /> }
  `,
  "/project/src/HookUsage.ts": `
    import { useAuth as authenticate } from './auth';
    export function MyComponent() {
      authenticate();
    }
  `,
  "/project/src/EdgeCase.ts": `
    import { "default" as LoginForm } from './LoginForm';
    export default function Example() {
      return <LoginForm />;
    }
  `,
};

// Mock platformUtils
jest.mock("../utils/platformUtils", () => ({
  ...jest.requireActual("../utils/platformUtils"),
  readFile: jest.fn((filePath: string) => fakeFiles[filePath] || ""),
  pathExists: jest.fn((filePath: string) => filePath in fakeFiles),
}));


// Mock globSync to return just the fake file paths
jest.mock("glob", () => ({
    ...jest.requireActual("glob"),
    globSync: jest.fn(() => Object.keys(fakeFiles)),
  }));

describe("findComponentUsages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("detects direct JSX component usage", () => {
    const files = findComponentUsages("LoginForm");
    expect(files).toContain("/project/src/ComponentDirect.tsx");
  });

  it("detects aliased JSX usage", () => {
    const files = findComponentUsages("LoginForm");
    expect(files).toContain("/project/src/ComponentAliased.tsx");
  });

  it("detects aliased hook usage", () => {
    const files = findComponentUsages("useAuth");
    expect(files).toContain("/project/src/HookUsage.ts");
  });

  it("handles StringLiteral named import edge case", () => {
    const files = findComponentUsages("LoginForm");
    expect(files).toContain("/project/src/EdgeCase.ts");
  });
});