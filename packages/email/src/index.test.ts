import { describe, expect, it } from "vitest";
import { welcomeEmailPropsSchema } from "./templates/welcome";

describe("email templates", () => {
  it("validates welcome email props", () => {
    expect(welcomeEmailPropsSchema.parse({ name: "Test" })).toEqual({ name: "Test" });
  });
});
