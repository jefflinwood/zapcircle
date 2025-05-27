import { deduplicateComponentsInToml } from "../utils/deduplicateComponentsInToml";
import toml from "@iarna/toml";

const brokenToml = `
[[components]]
name = "LoginForm"
description = "First one"

[[components]]
name = "LoginForm"
description = "Second one"

[[components]]
name = "Dashboard"
description = "Unique"
`;

test("deduplicates duplicate [[components]] blocks by name", () => {
  const cleaned = deduplicateComponentsInToml(brokenToml);
  const parsed = toml.parse(cleaned) as any;

  expect(parsed.components.length).toBe(2);
  expect(parsed.components.find((c: any) => c.name === "LoginForm").description).toBe("Second one");
});