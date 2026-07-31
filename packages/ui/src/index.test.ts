import { describe, expect, it } from "vitest";
import { padelskiTheme } from "./theme";

describe("ui theme", () => {
  it("uses teal as primary color", () => {
    expect(padelskiTheme.primaryColor).toBe("teal");
  });
});
