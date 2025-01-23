import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';

export const configureZapCircle = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = (question: string): Promise<string> =>
    new Promise((resolve) => rl.question(question, resolve));

  const userConfigDir = path.join(require('os').homedir(), '.zapcircle');
  const userConfigPath = path.join(userConfigDir, 'zapcircle.cli.toml');

  if (!fs.existsSync(userConfigDir)) {
    fs.mkdirSync(userConfigDir);
  }

  console.log('Configuring ZapCircle CLI...\n');

  const preferredLLM = await askQuestion('Preferred LLM (openai): ') || 'openai';
  const largeModel = await askQuestion('OpenAI large model (default: o1): ') || 'o1';
  const smallModel = await askQuestion('OpenAI small model (default: o1-mini): ') || 'o1-mini';
  const apiKey = await askQuestion('OpenAI API key: ');

  rl.close();

  const config = {
    preferredLLM,
    models: {
      large: largeModel,
      small: smallModel,
    },
    apiKey,
  };

  fs.writeFileSync(userConfigPath, `# ZapCircle CLI Configuration
preferredLLM = "${config.preferredLLM}"
apiKey = "${config.apiKey}"

[models]
large = "${config.models.large}"
small = "${config.models.small}"
`);

  console.log(`Configuration saved to ${userConfigPath}`);
};