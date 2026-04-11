-- Migration 003: Drug PA info + submission/tracking columns
-- Run this in your Supabase SQL editor (Settings → SQL Editor → New Query)

-- Drug PA info (pharmacy prior auths — brand/generic/dosage/step therapy)
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS drug_pa_info JSONB;

-- Submission tracking
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS submission_method TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS submission_confirmation TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS payer_case_number TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS follow_up_notes TEXT;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS peer_to_peer_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE public.prior_auths ADD COLUMN IF NOT EXISTS denial_code TEXT;
