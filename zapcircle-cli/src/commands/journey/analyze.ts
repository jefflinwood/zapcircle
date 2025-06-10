// 📁 src/commandline/journey/analyze.ts
import { loadAllBehaviors } from "../../utils/loadAllBehaviors";
import { buildJourneyFromBehaviors } from "../../journey/buildJourney";
import { validateJourney } from "../../core/journey/validateJourneySchema";
import fs from "fs";
import path from "path";

export async function journeyAnalyzeCommand() {
  console.log("🔍 Analyzing behaviors to construct user journeys...");

  const behaviorFiles = await loadAllBehaviors();
  const journeys = await buildJourneyFromBehaviors(behaviorFiles);

  console.log("\n📦 Suggested User Journeys:\n");
  for (const journey of journeys) {
    const result = validateJourney(journey);
    if (!result.success) {
      console.error(
        `❌ Invalid journey '${journey.title}':`,
        result.error.format(),
      );
      continue;
    }

    const symbol =
      journey.type === "golden" ? "🎯" : journey.type === "edge" ? "🧪" : "🛡️";
    console.log(`${symbol} ${journey.title}`);

    const outputPath = path.resolve("journeys", `${journey.id}.journey.json`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(journey, null, 2));
  }

  console.log(
    "\n💡 Run `zapcircle journey generate` to create tests or diagrams from these journeys.\n",
  );
}
