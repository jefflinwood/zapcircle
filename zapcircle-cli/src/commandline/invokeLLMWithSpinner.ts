import { invokeLLM } from "../core/llmService";

export async function invokeLLMWithSpinner(
  prompt: string,
  isVerbose: boolean,
  isLarge = false,
  showSpinner = true,
): Promise<string> {
  if (!showSpinner) {
    return await invokeLLM(prompt, isVerbose, isLarge);
  }

  const spinnerChars = ["|", "/", "-", "\\"];
  let i = 0;

  process.stdout.write("Processing... ");

  const spinnerInterval = setInterval(() => {
    process.stdout.write(`\rProcessing... ${spinnerChars[i]}`);
    i = (i + 1) % spinnerChars.length;
  }, 100);

  try {
    const result = await invokeLLM(prompt, isVerbose, isLarge);
    clearInterval(spinnerInterval);
    process.stdout.write("\rProcessing... done!\n");
    return result;
  } catch (error) {
    clearInterval(spinnerInterval);
    process.stdout.write("\rProcessing... failed!\n");
    throw error;
  }
}
