CREATE TYPE "sabercuidar"."contact_relation" AS ENUM('conjuge', 'filho', 'filha', 'mae', 'pai', 'irmao', 'irma', 'neto', 'neta', 'sobrinho', 'sobrinha', 'amigo', 'vizinho', 'cuidador', 'outro');--> statement-breakpoint
CREATE TABLE "sabercuidar"."patient_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"relation" "sabercuidar"."contact_relation" DEFAULT 'outro' NOT NULL,
	"phone" varchar(15) NOT NULL,
	"phone_2" varchar(15),
	"email" varchar(255),
	"is_primary" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sabercuidar"."patients" DROP CONSTRAINT "patients_cpf_unique";--> statement-breakpoint
ALTER TABLE "sabercuidar"."patients" ALTER COLUMN "cpf" SET DATA TYPE varchar(11);--> statement-breakpoint
ALTER TABLE "sabercuidar"."patients" ALTER COLUMN "phone" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "sabercuidar"."patients" ALTER COLUMN "phone_2" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "sabercuidar"."patients" ALTER COLUMN "zip_code" SET DATA TYPE varchar(8);--> statement-breakpoint
ALTER TABLE "sabercuidar"."patient_contacts" ADD CONSTRAINT "patient_contacts_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "sabercuidar"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "patient_contacts_patient_idx" ON "sabercuidar"."patient_contacts" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "patient_contacts_primary_idx" ON "sabercuidar"."patient_contacts" USING btree ("patient_id","is_primary");--> statement-breakpoint
ALTER TABLE "sabercuidar"."patients" DROP COLUMN "guardian_name";--> statement-breakpoint
ALTER TABLE "sabercuidar"."patients" DROP COLUMN "guardian_phone";--> statement-breakpoint
ALTER TABLE "sabercuidar"."patients" DROP COLUMN "guardian_relation";--> statement-breakpoint
ALTER TABLE "sabercuidar"."patients" DROP COLUMN "rf_data_json";--> statement-breakpoint
ALTER TABLE "sabercuidar"."patients" DROP COLUMN "rf_last_sync";