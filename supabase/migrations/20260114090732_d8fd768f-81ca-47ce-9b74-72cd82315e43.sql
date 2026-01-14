-- Add new fields to patients table for expanded clinical workflow

-- Basic Info expansions
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS medical_history TEXT[], -- Array of conditions
ADD COLUMN IF NOT EXISTS current_medications TEXT[]; -- Array of medications

-- Extra-Oral Examination fields
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS lip_strain BOOLEAN,
ADD COLUMN IF NOT EXISTS nasolabial_angle NUMERIC(5,1), -- 70-130 degrees
ADD COLUMN IF NOT EXISTS mentolabial_sulcus TEXT, -- Pronounced/Normal/Non-existing
ADD COLUMN IF NOT EXISTS max_jaw_opening NUMERIC(5,1); -- mm

-- Enhanced Clinical Relations
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS molar_class_subdivision TEXT, -- e.g., "Div 1", "Div 2"
ADD COLUMN IF NOT EXISTS canine_class_subdivision TEXT,
ADD COLUMN IF NOT EXISTS crossbite_anterior TEXT, -- None/Single/Multiple
ADD COLUMN IF NOT EXISTS crossbite_posterior TEXT, -- None/Unilateral/Bilateral
ADD COLUMN IF NOT EXISTS midline_shift TEXT, -- None/Right/Left
ADD COLUMN IF NOT EXISTS midline_discrepancy NUMERIC(5,1); -- mm

-- Cephalometric Analysis fields
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS ceph_sna NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS ceph_snb NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS ceph_anb NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS ceph_wits NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS ceph_sn_mp NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS ceph_fma NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS ceph_facial_angle NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS ceph_gonial_angle NUMERIC(5,1);

-- Add impacted status to dental chart
-- First, we'll update the status column to allow 'impacted'
-- Note: The current status is a string, so it already supports any value