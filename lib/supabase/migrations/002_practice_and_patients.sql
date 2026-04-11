-- Migration 002: Practice profiles and extended patient fields
-- Run this in your Supabase SQL editor

-- Practice profiles (one per user account)
CREATE TABLE IF NOT EXISTS public.practice_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Practice identity
  practice_name TEXT NOT NULL,
  practice_type TEXT,
  specialty TEXT,

  -- Ordering provider (the physician)
  physician_name TEXT NOT NULL,
  physician_npi TEXT NOT NULL,
  physician_credentials TEXT,

  -- Practice contact
  practice_address TEXT NOT NULL,
  practice_city TEXT NOT NULL,
  practice_state TEXT NOT NULL DEFAULT 'IL',
  practice_zip TEXT NOT NULL,
  practice_phone TEXT NOT NULL,
  practice_fax TEXT,
  practice_tax_id TEXT,

  -- Payer relationships
  in_network_payers TEXT[] DEFAULT ARRAY['bcbs_il','aetna','uhc','cigna','humana'],

  -- Setup status
  setup_completed BOOLEAN DEFAULT FALSE,
  setup_completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for practice_profiles
ALTER TABLE public.practice_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own practice" ON public.practice_profiles FOR ALL USING (auth.uid() = user_id);

-- Add new columns to prior_auths
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS patient_dob DATE;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS patient_member_id TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS patient_group_number TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS patient_plan_name TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS requested_service_date DATE;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergent'));
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS place_of_service TEXT DEFAULT 'outpatient';
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS rendering_provider_name TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS rendering_provider_npi TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS rendering_facility_name TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS rendering_facility_address TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS auth_number TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS auth_valid_from DATE;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS auth_valid_through DATE;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS extracted_clinical_data JSONB;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS complete_pa_form JSONB;

-- Add setup flag to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS practice_setup_completed BOOLEAN DEFAULT FALSE;
