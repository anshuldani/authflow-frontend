-- Migration 003: All extended columns + practice_profiles table
-- Paste this entire file into: Supabase Dashboard → SQL Editor → New Query → Run

-- ── Practice profiles ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.practice_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  practice_name TEXT NOT NULL,
  practice_type TEXT,
  specialty TEXT,
  physician_name TEXT NOT NULL,
  physician_npi TEXT NOT NULL,
  physician_credentials TEXT,
  practice_address TEXT NOT NULL,
  practice_city TEXT NOT NULL,
  practice_state TEXT NOT NULL DEFAULT 'IL',
  practice_zip TEXT NOT NULL,
  practice_phone TEXT NOT NULL,
  practice_fax TEXT,
  practice_tax_id TEXT,
  in_network_payers TEXT[] DEFAULT ARRAY['bcbs_il','aetna','uhc','cigna','humana'],
  setup_completed BOOLEAN DEFAULT FALSE,
  setup_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.practice_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'practice_profiles' AND policyname = 'Users manage own practice'
  ) THEN
    CREATE POLICY "Users manage own practice" ON public.practice_profiles FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── Extended prior_auths columns ───────────────────────────────────────────
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
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS complete_pa_form JSONB;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS extracted_clinical_data JSONB;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS drug_pa_info JSONB;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS submission_method TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS submission_confirmation TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS payer_case_number TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS follow_up_notes TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS peer_to_peer_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS denial_code TEXT;

-- ── Users table additions ──────────────────────────────────────────────────
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS practice_setup_completed BOOLEAN DEFAULT FALSE;
