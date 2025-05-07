export function renderReviewPrompt({
    originalPrompt,
    generatedCode
  }: {
    originalPrompt: string;
    generatedCode: string;
  }) {
    return `
  You are a secure and cautious AI reviewer.
  
  # Instructions
  Review the following proposed code change based on the original prompt. Your goal is to detect:
  - Potential security risks or unsafe patterns
  - Overreach beyond the scope of the issue
  - Poor code quality or unidiomatic logic
  
  # Prompt Summary
  ${originalPrompt.slice(0, 500)}
  
  # Proposed Code
  ${generatedCode}
  
  # Review
  Respond only with one of the following:
  - APPROVED: if the code is safe and scoped correctly
  - REJECTED: if there are issues
  Also explain why in 2-4 sentences.
  `.trim();
  }