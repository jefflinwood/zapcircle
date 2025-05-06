// types.ts

export interface ContextPackage {
  entryFile: string;
  files: Record<string, string>; // path => contents
  behaviorFile?: string;         // contents of behavior file
  stateFiles?: Record<string, string>; // path => contents
}