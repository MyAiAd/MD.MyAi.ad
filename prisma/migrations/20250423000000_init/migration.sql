-- CreateTable
CREATE TABLE "healthcare_providers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subscription_tier" TEXT NOT NULL DEFAULT 'base',
    "subscription_status" TEXT NOT NULL DEFAULT 'trial',
    "max_patients" INTEGER NOT NULL DEFAULT 1000,
    "custom_domain" TEXT,
    "branding_settings" JSONB,

    CONSTRAINT "healthcare_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATE,
    "health_conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "medications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dietary_restrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "consent_status" TEXT NOT NULL DEFAULT 'pending',
    "consent_date" TIMESTAMPTZ,
    "preferred_frequency" TEXT,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_templates" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" JSONB,
    "mjml_content" TEXT,
    "template_type" TEXT NOT NULL DEFAULT 'react-email',
    "target_conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "target_medications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "target_dietary" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "newsletter_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_campaigns" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "scheduled_date" TIMESTAMPTZ,
    "sent_date" TIMESTAMPTZ,
    "target_patient_count" INTEGER NOT NULL DEFAULT 0,
    "actual_send_count" INTEGER NOT NULL DEFAULT 0,
    "open_count" INTEGER NOT NULL DEFAULT 0,
    "click_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_analytics" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaign_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "email_sent" BOOLEAN NOT NULL DEFAULT false,
    "email_delivered" BOOLEAN NOT NULL DEFAULT false,
    "email_opened" BOOLEAN NOT NULL DEFAULT false,
    "links_clicked" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "open_timestamp" TIMESTAMPTZ,
    "click_timestamps" JSONB,

    CONSTRAINT "newsletter_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_outcomes" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "measurement_type" TEXT NOT NULL,
    "measurement_value" DOUBLE PRECISION NOT NULL,
    "measurement_date" TIMESTAMPTZ NOT NULL,
    "notes" TEXT,

    CONSTRAINT "health_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "healthcare_providers_email_key" ON "healthcare_providers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patients_provider_id_email_key" ON "patients"("provider_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_analytics_campaign_id_patient_id_key" ON "newsletter_analytics"("campaign_id", "patient_id");

-- CreateIndex
CREATE INDEX "idx_patients_provider_id" ON "patients"("provider_id");

-- CreateIndex
CREATE INDEX "idx_patients_health_conditions" ON "patients" USING GIN ("health_conditions");

-- CreateIndex
CREATE INDEX "idx_patients_medications" ON "patients" USING GIN ("medications");

-- CreateIndex
CREATE INDEX "idx_patients_dietary_restrictions" ON "patients" USING GIN ("dietary_restrictions");

-- CreateIndex
CREATE INDEX "idx_templates_provider_id" ON "newsletter_templates"("provider_id");

-- CreateIndex
CREATE INDEX "idx_templates_target_conditions" ON "newsletter_templates" USING GIN ("target_conditions");

-- CreateIndex
CREATE INDEX "idx_templates_target_medications" ON "newsletter_templates" USING GIN ("target_medications");

-- CreateIndex
CREATE INDEX "idx_templates_target_dietary" ON "newsletter_templates" USING GIN ("target_dietary");

-- CreateIndex
CREATE INDEX "idx_templates_template_type" ON "newsletter_templates"("template_type");

-- CreateIndex
CREATE INDEX "idx_campaigns_provider_id" ON "newsletter_campaigns"("provider_id");

-- CreateIndex
CREATE INDEX "idx_campaigns_template_id" ON "newsletter_campaigns"("template_id");

-- CreateIndex
CREATE INDEX "idx_campaigns_status" ON "newsletter_campaigns"("status");

-- CreateIndex
CREATE INDEX "idx_analytics_campaign_id" ON "newsletter_analytics"("campaign_id");

-- CreateIndex
CREATE INDEX "idx_analytics_patient_id" ON "newsletter_analytics"("patient_id");

-- CreateIndex
CREATE INDEX "idx_health_outcomes_provider_id" ON "health_outcomes"("provider_id");

-- CreateIndex
CREATE INDEX "idx_health_outcomes_patient_id" ON "health_outcomes"("patient_id");

-- CreateIndex
CREATE INDEX "idx_health_outcomes_condition" ON "health_outcomes"("condition");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "healthcare_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_templates" ADD CONSTRAINT "newsletter_templates_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "healthcare_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_campaigns" ADD CONSTRAINT "newsletter_campaigns_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "healthcare_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_campaigns" ADD CONSTRAINT "newsletter_campaigns_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "newsletter_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_analytics" ADD CONSTRAINT "newsletter_analytics_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "newsletter_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_analytics" ADD CONSTRAINT "newsletter_analytics_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_outcomes" ADD CONSTRAINT "health_outcomes_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "healthcare_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_outcomes" ADD CONSTRAINT "health_outcomes_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
