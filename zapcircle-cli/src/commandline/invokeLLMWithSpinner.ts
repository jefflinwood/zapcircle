import { invokeLLM } from "../core/llmService";

export async function invokeLLMWithSpinner(prompt: string): Promise<string> {
    const spinnerChars = ['|', '/', '-', '\\'];
    let i = 0;

    process.stdout.write("Processing... ");

    const spinnerInterval = setInterval(() => {
        process.stdout.write(`\rProcessing... ${spinnerChars[i]}`);
        i = (i + 1) % spinnerChars.length;
    }, 100);

    try {
        const result = await invokeLLM(prompt);
        clearInterval(spinnerInterval);
        process.stdout.write("\rProcessing... done!\n");
        return result;
    } catch (error) {
        clearInterval(spinnerInterval);
        process.stdout.write("\rProcessing... failed!\n");
        throw error;
    }
}
