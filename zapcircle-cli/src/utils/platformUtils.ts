import * as fs from "fs";
import { homedir } from "os";
import path from "path";
import * as readline from "readline";


export const getHomeDir = (): string => homedir();

export const pathExists = (p: string): boolean => fs.existsSync(p);

export const createDirectory = (p: string): string | undefined => fs.mkdirSync(p, { recursive: true });

export const writeFile = (filePath: string, contents: string): void => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, contents, "utf-8");
};

export const getConfigPath = (fileName = "zapcircle.cli.toml"): string =>
  path.join(getHomeDir(), ".zapcircle", fileName);


export const getCurrentDir = (): string => process.cwd();
export const readFile = (filePath: string): string => fs.readFileSync(filePath, "utf-8");
export const stat = (filePath: string): fs.Stats => fs.statSync(filePath);

export const readDir = (dirPath: string): string[] =>
  fs.readdirSync(dirPath)

export const createReadlineInterface = (): readline.Interface => {
    return readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  };