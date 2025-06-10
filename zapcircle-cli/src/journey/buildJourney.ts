import { parse } from "@iarna/toml";
import { Journey } from "./types";

export async function buildJourneyFromBehaviors(
  behaviorFiles: { filePath: string; contents: string }[],
): Promise<Journey[]> {
  const journeys: Journey[] = [];

  for (const { filePath, contents } of behaviorFiles) {
    const parsed: any = parse(contents);
    const name =
      parsed.name || filePath.split("/").pop()?.replace(".zap.toml", "");

    if (name?.toLowerCase().includes("signup")) {
      journeys.push({
        id: "golden-path-signup",
        title: "User signs up and lands on dashboard",
        type: "golden",
        steps: [
          {
            stepId: "signup-001",
            component: name,
            path: parsed.path || "/signup",
            action: {
              type: "form",
              inputs: {
                "#email": "test@example.com",
                "#password": "hunter2",
              },
              submit: parsed.submit || "text=Sign Up",
            },
            assertions: [
              {
                type: "url",
                expected: "/dashboard",
              },
            ],
          },
        ],
        linkedBehaviors: [filePath],
      });
    }
  }

  return journeys;
}
