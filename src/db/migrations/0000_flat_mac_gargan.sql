CREATE SCHEMA "sabercuidar";
--> statement-breakpoint
CREATE TYPE "sabercuidar"."gender" AS ENUM('masculino', 'feminino', 'outro', 'nao_informado');--> statement-breakpoint
CREATE TYPE "sabercuidar"."medication_route" AS ENUM('oral', 'subcutanea', 'intravenosa', 'intramuscular', 'topica', 'inalatoria', 'retal', 'sublingual', 'ocular', 'outro');--> statement-breakpoint
CREATE TYPE "sabercuidar"."patient_status" AS ENUM('ativo', 'inativo', 'alta', 'obito', 'suspeso');--> statement-breakpoint
CREATE TYPE "sabercuidar"."prescription_status" AS ENUM('ativa', 'suspensa', 'concluida', 'cancelada');--> statement-breakpoint
CREATE TYPE "sabercuidar"."professional_type" AS ENUM('medico', 'enfermeiro', 'fisioterapeuta', 'tecnico_enfermagem', 'fonoaudiologo', 'nutricionista', 'psicologo', 'assistente_social', 'cuidador', 'outro');--> statement-breakpoint
CREATE TYPE "sabercuidar"."user_role" AS ENUM('admin', 'coordinator', 'professional', 'viewer');--> statement-breakpoint
CREATE TYPE "sabercuidar"."visit_status" AS ENUM('agendada', 'em_andamento', 'concluida', 'cancelada', 'nao_realizada');--> statement-breakpoint
CREATE TABLE "sabercuidar"."medication_administrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prescription_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"administered_by" uuid NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"administered_at" timestamp,
	"skipped" boolean DEFAULT false NOT NULL,
	"skip_reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sabercuidar"."medications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"generic_name" varchar(255),
	"presentation" varchar(100),
	"manufacturer" varchar(255),
	"anvisa_code" varchar(50),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sabercuidar"."patient_professionals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"professional_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"start_date" date,
	"end_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sabercuidar"."patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"social_name" varchar(255),
	"cpf" varchar(14),
	"rg" varchar(30),
	"birth_date" date,
	"gender" "sabercuidar"."gender" DEFAULT 'nao_informado' NOT NULL,
	"phone" varchar(20),
	"phone_2" varchar(20),
	"email" varchar(255),
	"zip_code" varchar(9),
	"street" varchar(255),
	"number" varchar(20),
	"complement" varchar(100),
	"neighborhood" varchar(100),
	"city" varchar(100),
	"state" varchar(2),
	"guardian_name" varchar(255),
	"guardian_phone" varchar(20),
	"guardian_relation" varchar(100),
	"status" "sabercuidar"."patient_status" DEFAULT 'ativo' NOT NULL,
	"primary_diagnosis" text,
	"secondary_diagnoses" text,
	"allergies" text,
	"blood_type" varchar(5),
	"weight" numeric(5, 2),
	"height" integer,
	"health_plan" varchar(255),
	"health_plan_number" varchar(100),
	"rf_data_json" text,
	"rf_last_sync" timestamp,
	"admission_date" date,
	"discharge_date" date,
	"notes" text,
	"photo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patients_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "sabercuidar"."prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"prescribed_by" uuid NOT NULL,
	"medication_id" uuid NOT NULL,
	"dosage" varchar(100) NOT NULL,
	"frequency" varchar(100) NOT NULL,
	"route" "sabercuidar"."medication_route" DEFAULT 'oral' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"status" "sabercuidar"."prescription_status" DEFAULT 'ativa' NOT NULL,
	"instructions" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sabercuidar"."professionals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" varchar(255) NOT NULL,
	"type" "sabercuidar"."professional_type" NOT NULL,
	"council_number" varchar(50),
	"council_state" varchar(2),
	"cpf" varchar(14),
	"phone" varchar(20),
	"email" varchar(255),
	"specialties" text,
	"active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "professionals_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "sabercuidar"."saved_searches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"filters" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sabercuidar"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "sabercuidar"."user_role" DEFAULT 'viewer' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sabercuidar"."visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"professional_id" uuid NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"started_at" timestamp,
	"finished_at" timestamp,
	"status" "sabercuidar"."visit_status" DEFAULT 'agendada' NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"clinical_evolution" text,
	"vital_signs" text,
	"procedures" text,
	"recommendations" text,
	"patient_signature_url" text,
	"ai_summary" text,
	"ai_generated_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sabercuidar"."medication_administrations" ADD CONSTRAINT "medication_administrations_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "sabercuidar"."prescriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sabercuidar"."medication_administrations" ADD CONSTRAINT "medication_administrations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "sabercuidar"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sabercuidar"."medication_administrations" ADD CONSTRAINT "medication_administrations_administered_by_professionals_id_fk" FOREIGN KEY ("administered_by") REFERENCES "sabercuidar"."professionals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sabercuidar"."patient_professionals" ADD CONSTRAINT "patient_professionals_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "sabercuidar"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sabercuidar"."patient_professionals" ADD CONSTRAINT "patient_professionals_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "sabercuidar"."professionals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sabercuidar"."prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "sabercuidar"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sabercuidar"."prescriptions" ADD CONSTRAINT "prescriptions_prescribed_by_professionals_id_fk" FOREIGN KEY ("prescribed_by") REFERENCES "sabercuidar"."professionals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sabercuidar"."prescriptions" ADD CONSTRAINT "prescriptions_medication_id_medications_id_fk" FOREIGN KEY ("medication_id") REFERENCES "sabercuidar"."medications"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sabercuidar"."professionals" ADD CONSTRAINT "professionals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "sabercuidar"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sabercuidar"."saved_searches" ADD CONSTRAINT "saved_searches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "sabercuidar"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sabercuidar"."visits" ADD CONSTRAINT "visits_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "sabercuidar"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sabercuidar"."visits" ADD CONSTRAINT "visits_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "sabercuidar"."professionals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "med_admin_prescription_idx" ON "sabercuidar"."medication_administrations" USING btree ("prescription_id");--> statement-breakpoint
CREATE INDEX "med_admin_patient_idx" ON "sabercuidar"."medication_administrations" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "med_admin_scheduled_idx" ON "sabercuidar"."medication_administrations" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "medications_name_idx" ON "sabercuidar"."medications" USING btree ("name");--> statement-breakpoint
CREATE INDEX "patient_professionals_patient_idx" ON "sabercuidar"."patient_professionals" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "patient_professionals_professional_idx" ON "sabercuidar"."patient_professionals" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "patients_cpf_idx" ON "sabercuidar"."patients" USING btree ("cpf");--> statement-breakpoint
CREATE INDEX "patients_status_idx" ON "sabercuidar"."patients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "patients_name_idx" ON "sabercuidar"."patients" USING btree ("name");--> statement-breakpoint
CREATE INDEX "prescriptions_patient_idx" ON "sabercuidar"."prescriptions" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "prescriptions_status_idx" ON "sabercuidar"."prescriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "professionals_cpf_idx" ON "sabercuidar"."professionals" USING btree ("cpf");--> statement-breakpoint
CREATE INDEX "professionals_type_idx" ON "sabercuidar"."professionals" USING btree ("type");--> statement-breakpoint
CREATE INDEX "saved_searches_user_idx" ON "sabercuidar"."saved_searches" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "sabercuidar"."users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "visits_patient_idx" ON "sabercuidar"."visits" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "visits_professional_idx" ON "sabercuidar"."visits" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "visits_scheduled_idx" ON "sabercuidar"."visits" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "visits_status_idx" ON "sabercuidar"."visits" USING btree ("status");