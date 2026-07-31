import { AbilityBuilder, type MongoAbility, createMongoAbility } from "@casl/ability";
import { z } from "zod";

export const roleSchema = z.enum(["member", "organizer", "admin"]);
export type Role = z.infer<typeof roleSchema>;

export const actionSchema = z.enum(["read", "manage", "approve"]);
export type Action = z.infer<typeof actionSchema>;

export const subjectSchema = z.enum(["PlaySession", "Match", "SlotClaim", "Organization"]);
export type Subject = z.infer<typeof subjectSchema>;

export type AppAbility = MongoAbility<[Action, Subject]>;

export function defineAbilitiesFor(role: Role): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  can("read", "PlaySession");
  can("read", "Match");

  if (role === "organizer" || role === "admin") {
    can("manage", "PlaySession");
    can("approve", "SlotClaim");
  }

  if (role === "admin") {
    can("manage", "Organization");
  }

  return build();
}
