CREATE TYPE "public"."match_status" AS ENUM('scheduled', 'in_progress', 'finished', 'voided');--> statement-breakpoint
CREATE TYPE "public"."match_team" AS ENUM('A', 'B');--> statement-breakpoint
CREATE TYPE "public"."play_session_status" AS ENUM('setup', 'active', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."play_session_visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "public"."score_event_action" AS ENUM('increment', 'decrement', 'type', 'undo');--> statement-breakpoint
CREATE TYPE "public"."score_event_team" AS ENUM('A', 'B');--> statement-breakpoint
CREATE TYPE "public"."slot_claim_status" AS ENUM('requested', 'awaiting_organizer', 'approved', 'applied', 'rejected', 'expired', 'detached');--> statement-breakpoint
CREATE TABLE "match_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"match_id" uuid NOT NULL,
	"slot_id" uuid NOT NULL,
	"team" "match_team" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"play_session_id" uuid NOT NULL,
	"status" "match_status" DEFAULT 'scheduled' NOT NULL,
	"result" jsonb DEFAULT '{"teamA":0,"teamB":0}'::jsonb NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "play_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"organizer_player_id" uuid NOT NULL,
	"court_block_ref" text NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"status" "play_session_status" DEFAULT 'setup' NOT NULL,
	"visibility" "play_session_visibility" DEFAULT 'public' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"nickname" text NOT NULL,
	"full_name" text,
	"user_id" uuid,
	CONSTRAINT "players_nickname_unique" UNIQUE("nickname")
);
--> statement-breakpoint
CREATE TABLE "score_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"match_id" uuid NOT NULL,
	"actor_slot_id" uuid NOT NULL,
	"action" "score_event_action" NOT NULL,
	"team" "score_event_team",
	"payload" jsonb,
	"ref_event_id" uuid
);
--> statement-breakpoint
CREATE TABLE "slot_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"slot_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"status" "slot_claim_status" DEFAULT 'requested' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"play_session_id" uuid NOT NULL,
	"nickname" text NOT NULL,
	"player_id" uuid
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"email" text NOT NULL,
	"name" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "match_slots" ADD CONSTRAINT "match_slots_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_play_session_id_play_sessions_id_fk" FOREIGN KEY ("play_session_id") REFERENCES "public"."play_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_sessions" ADD CONSTRAINT "play_sessions_organizer_player_id_players_id_fk" FOREIGN KEY ("organizer_player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_events" ADD CONSTRAINT "score_events_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_claims" ADD CONSTRAINT "slot_claims_slot_id_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_claims" ADD CONSTRAINT "slot_claims_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slots" ADD CONSTRAINT "slots_play_session_id_play_sessions_id_fk" FOREIGN KEY ("play_session_id") REFERENCES "public"."play_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slots" ADD CONSTRAINT "slots_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "match_slots_match_id_idx" ON "match_slots" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "match_slots_slot_id_idx" ON "match_slots" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX "matches_play_session_id_status_idx" ON "matches" USING btree ("play_session_id","status");--> statement-breakpoint
CREATE INDEX "matches_finished_at_idx" ON "matches" USING btree ("finished_at");--> statement-breakpoint
CREATE INDEX "play_sessions_scheduled_at_idx" ON "play_sessions" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "play_sessions_organizer_player_id_idx" ON "play_sessions" USING btree ("organizer_player_id");--> statement-breakpoint
CREATE INDEX "players_user_id_idx" ON "players" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "score_events_match_id_idx" ON "score_events" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "score_events_created_at_idx" ON "score_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "slot_claims_slot_id_idx" ON "slot_claims" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX "slot_claims_player_id_idx" ON "slot_claims" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "slot_claims_status_idx" ON "slot_claims" USING btree ("status");--> statement-breakpoint
CREATE INDEX "slots_play_session_id_idx" ON "slots" USING btree ("play_session_id");--> statement-breakpoint
CREATE INDEX "slots_player_id_idx" ON "slots" USING btree ("player_id");