import {
  uuid,
  varchar,
  text,
  date,
  timestamp,
  boolean,
  integer,
  decimal,
  index,
  pgSchema,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// =============================================================
//  SCHEMA DEFINITION
// =============================================================

export const sabercuidarSchema = pgSchema("sabercuidar");

// =============================================================
//  ENUMS
// =============================================================

export const userRoleEnum = sabercuidarSchema.enum("user_role", [
  "admin",
  "coordinator",
  "professional",
  "viewer",
]);

export const genderEnum = sabercuidarSchema.enum("gender", [
  "masculino",
  "feminino",
  "outro",
  "nao_informado",
]);

export const patientStatusEnum = sabercuidarSchema.enum("patient_status", [
  "ativo",
  "inativo",
  "alta",
  "obito",
  "suspeso",
]);

export const professionalTypeEnum = sabercuidarSchema.enum("professional_type", [
  "medico",
  "enfermeiro",
  "fisioterapeuta",
  "tecnico_enfermagem",
  "fonoaudiologo",
  "nutricionista",
  "psicologo",
  "assistente_social",
  "cuidador",
  "outro",
]);

export const visitStatusEnum = sabercuidarSchema.enum("visit_status", [
  "agendada",
  "em_andamento",
  "concluida",
  "cancelada",
  "nao_realizada",
]);

export const medicationRouteEnum = sabercuidarSchema.enum("medication_route", [
  "oral",
  "subcutanea",
  "intravenosa",
  "intramuscular",
  "topica",
  "inalatoria",
  "retal",
  "sublingual",
  "ocular",
  "outro",
]);

export const prescriptionStatusEnum = sabercuidarSchema.enum("prescription_status", [
  "ativa",
  "suspensa",
  "concluida",
  "cancelada",
]);

// =============================================================
//  USUÁRIOS DO SISTEMA
// =============================================================

export const users = sabercuidarSchema.table(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: userRoleEnum("role").notNull().default("viewer"),
    active: boolean("active").notNull().default(true),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("users_email_idx").on(t.email)]
);

// =============================================================
//  PROFISSIONAIS DE SAÚDE
// =============================================================

export const professionals = sabercuidarSchema.table(
  "professionals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 255 }).notNull(),
    type: professionalTypeEnum("type").notNull(),
    councilNumber: varchar("council_number", { length: 50 }), // CRM, COREN, etc
    councilState: varchar("council_state", { length: 2 }),
    cpf: varchar("cpf", { length: 14 }).unique(),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    specialties: text("specialties"), // JSON array como texto
    active: boolean("active").notNull().default(true),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("professionals_cpf_idx").on(t.cpf),
    index("professionals_type_idx").on(t.type),
  ]
);

export const savedSearches = sabercuidarSchema.table(
  "saved_searches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    filters: text("filters").notNull(), // JSON string de { cnaes, municipios }
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("saved_searches_user_idx").on(t.userId)]
);

// =============================================================
//  PACIENTES (FICHA MÉDICA)
// =============================================================

export const patients = sabercuidarSchema.table(
  "patients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Dados pessoais
    name: varchar("name", { length: 255 }).notNull(),
    socialName: varchar("social_name", { length: 255 }),
    cpf: varchar("cpf", { length: 11 }),    // apenas números: 11 dígitos
    rg: varchar("rg", { length: 30 }),
    birthDate: date("birth_date"),
    gender: genderEnum("gender").notNull().default("nao_informado"),
    // Contato do próprio paciente
    phone: varchar("phone", { length: 15 }),  // apenas números
    phone2: varchar("phone_2", { length: 15 }),
    email: varchar("email", { length: 255 }),
    // Endereço
    zipCode: varchar("zip_code", { length: 8 }),  // apenas números: 8 dígitos
    street: varchar("street", { length: 255 }),
    number: varchar("number", { length: 20 }),
    complement: varchar("complement", { length: 100 }),
    neighborhood: varchar("neighborhood", { length: 100 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    // Dados clínicos
    status: patientStatusEnum("status").notNull().default("ativo"),
    primaryDiagnosis: text("primary_diagnosis"),
    secondaryDiagnoses: text("secondary_diagnoses"),
    allergies: text("allergies"),
    bloodType: varchar("blood_type", { length: 5 }),
    weight: decimal("weight", { precision: 5, scale: 2 }),
    height: integer("height"), // em cm
    // Plano de saúde
    healthPlan: varchar("health_plan", { length: 255 }),
    healthPlanNumber: varchar("health_plan_number", { length: 100 }),
    // Metadados
    admissionDate: date("admission_date"),
    dischargeDate: date("discharge_date"),
    notes: text("notes"),
    photoUrl: text("photo_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("patients_cpf_idx").on(t.cpf),
    index("patients_status_idx").on(t.status),
    index("patients_name_idx").on(t.name),
  ]
);

// =============================================================
//  CONTATOS / RESPONSÁVEIS DO PACIENTE
// =============================================================

export const contactRelationEnum = sabercuidarSchema.enum("contact_relation", [
  "conjuge",
  "filho",
  "filha",
  "mae",
  "pai",
  "irmao",
  "irma",
  "neto",
  "neta",
  "sobrinho",
  "sobrinha",
  "amigo",
  "vizinho",
  "cuidador",
  "outro",
]);

export const patientContacts = sabercuidarSchema.table(
  "patient_contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    relation: contactRelationEnum("relation").notNull().default("outro"),
    phone: varchar("phone", { length: 15 }).notNull(),  // apenas números
    phone2: varchar("phone_2", { length: 15 }),
    email: varchar("email", { length: 255 }),
    isPrimary: boolean("is_primary").notNull().default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("patient_contacts_patient_idx").on(t.patientId),
    index("patient_contacts_primary_idx").on(t.patientId, t.isPrimary),
  ]
);

// =============================================================
//  RELAÇÃO PACIENTE ↔ PROFISSIONAL
// =============================================================

export const patientProfessionals = sabercuidarSchema.table(
  "patient_professionals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => professionals.id, { onDelete: "cascade" }),
    isPrimary: boolean("is_primary").notNull().default(false),
    startDate: date("start_date"),
    endDate: date("end_date"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("patient_professionals_patient_idx").on(t.patientId),
    index("patient_professionals_professional_idx").on(t.professionalId),
  ]
);

// =============================================================
//  VISITAS DOMICILIARES
// =============================================================

export const visits = sabercuidarSchema.table(
  "visits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => professionals.id, { onDelete: "restrict" }),
    scheduledAt: timestamp("scheduled_at").notNull(),
    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at"),
    status: visitStatusEnum("status").notNull().default("agendada"),
    // Localização
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    // Relatório clínico
    clinicalEvolution: text("clinical_evolution"),
    vitalSigns: text("vital_signs"), // JSON: { pa, fc, fr, temp, spo2, ... }
    procedures: text("procedures"),
    recommendations: text("recommendations"),
    // Assinatura
    patientSignatureUrl: text("patient_signature_url"),
    // IA
    aiSummary: text("ai_summary"),
    aiGeneratedAt: timestamp("ai_generated_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("visits_patient_idx").on(t.patientId),
    index("visits_professional_idx").on(t.professionalId),
    index("visits_scheduled_idx").on(t.scheduledAt),
    index("visits_status_idx").on(t.status),
  ]
);

// =============================================================
//  MEDICAMENTOS
// =============================================================

export const medications = sabercuidarSchema.table(
  "medications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    genericName: varchar("generic_name", { length: 255 }),
    presentation: varchar("presentation", { length: 100 }), // Ex: "Comprimido 500mg"
    manufacturer: varchar("manufacturer", { length: 255 }),
    anvisaCode: varchar("anvisa_code", { length: 50 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("medications_name_idx").on(t.name)]
);

// =============================================================
//  PRESCRIÇÕES MÉDICAS
// =============================================================

export const prescriptions = sabercuidarSchema.table(
  "prescriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    prescribedBy: uuid("prescribed_by")
      .notNull()
      .references(() => professionals.id, { onDelete: "restrict" }),
    medicationId: uuid("medication_id")
      .notNull()
      .references(() => medications.id, { onDelete: "restrict" }),
    dosage: varchar("dosage", { length: 100 }).notNull(), // Ex: "500mg"
    frequency: varchar("frequency", { length: 100 }).notNull(), // Ex: "8/8h"
    route: medicationRouteEnum("route").notNull().default("oral"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    status: prescriptionStatusEnum("status").notNull().default("ativa"),
    instructions: text("instructions"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("prescriptions_patient_idx").on(t.patientId),
    index("prescriptions_status_idx").on(t.status),
  ]
);

// =============================================================
//  REGISTROS DE ADMINISTRAÇÃO MEDICAMENTOSA
// =============================================================

export const medicationAdministrations = sabercuidarSchema.table(
  "medication_administrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    prescriptionId: uuid("prescription_id")
      .notNull()
      .references(() => prescriptions.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    administeredBy: uuid("administered_by")
      .notNull()
      .references(() => professionals.id, { onDelete: "restrict" }),
    scheduledAt: timestamp("scheduled_at").notNull(),
    administeredAt: timestamp("administered_at"),
    skipped: boolean("skipped").notNull().default(false),
    skipReason: text("skip_reason"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("med_admin_prescription_idx").on(t.prescriptionId),
    index("med_admin_patient_idx").on(t.patientId),
    index("med_admin_scheduled_idx").on(t.scheduledAt),
  ]
);

// =============================================================
//  RELATIONS (para queries com join automático)
// =============================================================

export const usersRelations = relations(users, ({ one }) => ({
  professional: one(professionals, {
    fields: [users.id],
    references: [professionals.userId],
  }),
}));

export const professionalsRelations = relations(
  professionals,
  ({ one, many }) => ({
    user: one(users, {
      fields: [professionals.userId],
      references: [users.id],
    }),
    patientProfessionals: many(patientProfessionals),
    visits: many(visits),
    prescriptions: many(prescriptions),
  })
);

export const patientsRelations = relations(patients, ({ many }) => ({
  patientProfessionals: many(patientProfessionals),
  contacts: many(patientContacts),
  visits: many(visits),
  prescriptions: many(prescriptions),
  medicationAdministrations: many(medicationAdministrations),
}));

export const patientContactsRelations = relations(patientContacts, ({ one }) => ({
  patient: one(patients, {
    fields: [patientContacts.patientId],
    references: [patients.id],
  }),
}));

export const patientProfessionalsRelations = relations(
  patientProfessionals,
  ({ one }) => ({
    patient: one(patients, {
      fields: [patientProfessionals.patientId],
      references: [patients.id],
    }),
    professional: one(professionals, {
      fields: [patientProfessionals.professionalId],
      references: [professionals.id],
    }),
  })
);

export const visitsRelations = relations(visits, ({ one }) => ({
  patient: one(patients, {
    fields: [visits.patientId],
    references: [patients.id],
  }),
  professional: one(professionals, {
    fields: [visits.professionalId],
    references: [professionals.id],
  }),
}));

export const prescriptionsRelations = relations(
  prescriptions,
  ({ one, many }) => ({
    patient: one(patients, {
      fields: [prescriptions.patientId],
      references: [patients.id],
    }),
    prescriber: one(professionals, {
      fields: [prescriptions.prescribedBy],
      references: [professionals.id],
    }),
    medication: one(medications, {
      fields: [prescriptions.medicationId],
      references: [medications.id],
    }),
    administrations: many(medicationAdministrations),
  })
);

export const medicationAdministrationsRelations = relations(
  medicationAdministrations,
  ({ one }) => ({
    prescription: one(prescriptions, {
      fields: [medicationAdministrations.prescriptionId],
      references: [prescriptions.id],
    }),
    patient: one(patients, {
      fields: [medicationAdministrations.patientId],
      references: [patients.id],
    }),
    administeredBy: one(professionals, {
      fields: [medicationAdministrations.administeredBy],
      references: [professionals.id],
    }),
  })
);

// =============================================================
//  TIPOS DERIVADOS DO SCHEMA (Type Inference)
// =============================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Professional = typeof professionals.$inferSelect;
export type NewProfessional = typeof professionals.$inferInsert;
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type PatientContact = typeof patientContacts.$inferSelect;
export type NewPatientContact = typeof patientContacts.$inferInsert;
export type Visit = typeof visits.$inferSelect;
export type NewVisit = typeof visits.$inferInsert;
export type Medication = typeof medications.$inferSelect;
export type NewMedication = typeof medications.$inferInsert;
export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;
export type MedicationAdministration =
  typeof medicationAdministrations.$inferSelect;
export type NewMedicationAdministration =
  typeof medicationAdministrations.$inferInsert;
// =============================================================
//  EMPRESAS (PUBLIC SCHEMA)
// =============================================================

export type Empresa = typeof import("./external").empresas.$inferSelect;
export type Estabelecimento = typeof import("./external").estabelecimentos.$inferSelect;
export type Municipio = typeof import("./external").municipios.$inferSelect;
export type Cnae = typeof import("./external").cnaes.$inferSelect;
