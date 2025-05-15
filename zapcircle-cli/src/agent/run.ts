import path from "path";
import { buildContextForComponent } from "../context/index";
import { renderGenerationPrompt } from "./promptBuilder";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { findBehaviorForIssue } from "../behaviors/matcher";
import { findLikelyComponentForIssue } from "../behaviors/findComponent";
import { resolveComponentFromBehavior } from "../behaviors/resolveComponentFromBehavior";

import { writeOutputFile } from "../utils/writeOutputFile";
import { writeIssueLog } from "./writeIssueLog";
import { renderReviewPrompt } from "./renderReviewPrompt";
import { ensureBehaviorForComponent } from "../behaviors/ensureBehaviorForComponent";
import { AgentIssue } from "../issues/types";

export async function runAgentOnIssue(issue: AgentIssue) {
  console.log(`Running ZapCircle Agent on issue #${issue.id}...`);

  let behaviorPath: string | undefined;
  let componentPath: string | undefined;

  try {
    // Step 1: Find behavior or fallback to component
    behaviorPath = findBehaviorForIssue(issue);
    if (behaviorPath) {
      const resolved = resolveComponentFromBehavior(behaviorPath);
      if (!resolved)
        throw new Error("Could not find component file for matched behavior.");
      componentPath = resolved;
    } else {
      console.warn(
        "⚠️ No behavior file matched. Searching for relevant component...",
      );
      const guessed = findLikelyComponentForIssue(issue);
      if (!guessed) throw new Error("Could not guess component file.");
      componentPath = guessed;
      console.warn(`⚠️ Proceeding with: ${componentPath}`);
    }

    behaviorPath = await ensureBehaviorForComponent(componentPath);

    // Step 2: Build context
    const context = await buildContextForComponent(componentPath, behaviorPath);

    // Step 3: Construct prompt
    const prompt = renderGenerationPrompt({ issue, contextPackage: context });

    // Step 4: Generate code
    var result = await invokeLLMWithSpinner(prompt, true);

    // Step 5: Review code
    // First review attempt
    let reviewPrompt = renderReviewPrompt({
      originalPrompt: prompt,
      generatedCode: result,
    });
    let reviewResult = await invokeLLMWithSpinner(reviewPrompt, true);

    console.log("\n🔍 Review Result (1st pass):\n", reviewResult);

    let approved = reviewResult.trim().startsWith("APPROVED");

    if (!approved) {
      console.warn("⚠️ Review failed. Attempting one refinement pass...");

      // Refine the prompt with feedback
      const retryPrompt = `
    The last attempt was rejected for the following reason:

    ${reviewResult.trim()}

    Please regenerate the code with this in mind. Only modify what is necessary to address the original issue.

    ---

    ${prompt}
    `;

      const retriedResult = await invokeLLMWithSpinner(retryPrompt, true);

      // Second review
      const secondReviewPrompt = renderReviewPrompt({
        originalPrompt: prompt,
        generatedCode: retriedResult,
      });

      const secondReviewResult = await invokeLLMWithSpinner(
        secondReviewPrompt,
        true,
      );
      console.log("\n🔍 Review Result (2nd pass):\n", secondReviewResult);

      approved = secondReviewResult.trim().startsWith("APPROVED");

      if (!approved) {
        console.error("❌ Second review failed. Aborting write.");

        writeIssueLog(issue.id, {
          id: issue.id,
          status: "failed",
          title: issue.title,
          description: issue.description,
          comments: issue.comments,
          componentPath,
          behaviorPath,
          failedAt: new Date().toISOString(),
          reviewPassed: false,
          failureReason: "Second review failed: " + secondReviewResult.trim(),
        });

        return;
      }

      // Overwrite the result with the retried version
      result = retriedResult;
    }

    // Step 6: Write output
    const outputPath = path.resolve(componentPath);
    await writeOutputFile(outputPath, result, true);

    // ✅ Final log
    writeIssueLog(issue.id, {
      id: issue.id,
      status: "completed",
      title: issue.title,
      description: issue.description,
      comments: issue.comments,
      componentPath,
      behaviorPath,
      generatedAt: new Date().toISOString(),
      outputPath,
      promptPreview: prompt.slice(0, 500),
      reviewPassed: true,
    });

    console.log(`✅ Updated file written to: ${outputPath}`);
  } catch (err: any) {
    console.error(`❌ Agent run failed: ${err.message}`);

    writeIssueLog(issue.id, {
      id: issue.id,
      status: "failed",
      title: issue.title,
      description: issue.description,
      comments: issue.comments,
      behaviorPath,
      componentPath,
      failedAt: new Date().toISOString(),
      failureReason: err.message,
    });
  }
}
