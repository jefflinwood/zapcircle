import { program } from './commandLine';

describe('ZapCircle CLI', () => {
  let outputData: string[] = [];
  const storeLog = (inputs: string) => outputData.push(inputs);

  beforeEach(() => {
    outputData = [];
    jest.spyOn(console, 'log').mockImplementation(storeLog);
    jest.spyOn(console, 'error').mockImplementation(storeLog);
    program.exitOverride()
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle the `analyze` command', () => {
    process.argv = ['node', 'commandLine.ts', 'analyze', 'jsx', './src'];
    program.parse(process.argv);
    expect(outputData.join(' ')).toContain('Analyzing filetype "jsx" for the path "./src"...');
  });

  it('should handle the `generate` command', () => {
    process.argv = ['node', 'commandLine.ts', 'generate', 'jsx', './path/to/file.zap.toml'];
    program.parse(process.argv);
    expect(outputData.join(' ')).toContain('Generating "jsx" from "./path/to/file.zap.toml"...');
  });

  it('should handle the `generateTests` command', () => {
    process.argv = ['node', 'commandLine.ts', 'generateTests', 'jsx', './path/to/file.zap.toml', './path/file.jsx'];
    program.parse(process.argv);
    expect(outputData.join(' ')).toContain('Generating tests "jsx" from "./path/to/file.zap.toml" for "./path/file.jsx"');
  });

  it('should return an error for an unknown command', () => {
    process.argv = ['node', 'commandLine.ts', 'unknownCommand'];
    expect(() => program.parse(process.argv)).toThrowError(
      "error: unknown command 'unknownCommand'"
    );
  });
});