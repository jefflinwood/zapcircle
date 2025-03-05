const fs = require("fs");
const path = require("path");
const readline = require("readline");
const chalk = require("chalk");

export function writeOutputFile(
  filePath: string,
  contents: string,
  isInteractive = false,
) {
  if (fs.existsSync(filePath)) {
    if (isInteractive) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        chalk.yellow(
          `⚠️  File "${filePath}" already exists. Overwrite? (y/N): `,
        ),
        (answer: string) => {
          rl.close();
          if (answer.toLowerCase() === "y") {
            fs.writeFileSync(filePath, contents);
            console.log(chalk.green(`✅ Overwritten: ${filePath}`));
          } else {
            console.log(chalk.red("❌ Operation canceled."));
          }
        },
      );
    } else {
      fs.writeFileSync(filePath, contents);
      console.log(chalk.green(`✅ Overwritten: ${filePath}`));
    }
  } else {
    fs.writeFileSync(filePath, contents);
    console.log(chalk.blue(`📝 Created: ${filePath}`));
  }
}
