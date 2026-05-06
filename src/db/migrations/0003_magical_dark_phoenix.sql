CREATE TABLE "sabercuidar"."patient_ai_evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"requested_by" uuid NOT NULL,
	"model" varchar(100) NOT NULL,
	"response" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sabercuidar"."user_ai_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"openai_token" text,
	"openai_model" varchar(100) DEFAULT 'gpt-4o-mini' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_ai_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "sabercuidar"."patient_ai_evaluations" ADD CONSTRAINT "patient_ai_evaluations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "sabercuidar"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sabercuidar"."patient_ai_evaluations" ADD CONSTRAINT "patient_ai_evaluations_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "sabercuidar"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sabercuidar"."user_ai_settings" ADD CONSTRAINT "user_ai_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "sabercuidar"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "patient_ai_evals_patient_idx" ON "sabercuidar"."patient_ai_evaluations" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "patient_ai_evals_created_idx" ON "sabercuidar"."patient_ai_evaluations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_ai_settings_user_idx" ON "sabercuidar"."user_ai_settings" USING btree ("user_id");