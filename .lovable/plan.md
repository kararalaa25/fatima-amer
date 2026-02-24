

# Dark Mode Redesign + Admin Global Case View

## Overview
Complete visual overhaul to a dark mode aesthetic with purple (#7c3aed) primary accents, plus an admin "Global Case View" showing all users' cases. Authentication improvements for login reliability.

---

## 1. Theme Overhaul (src/index.css)

Replace the current light-first palette with a dark-first design:

| Token | Light Value | Dark Value (default) |
|-------|-------------|---------------------|
| --background | 240 6% 6% (#0b0b0e) | same |
| --foreground | 0 0% 95% | same |
| --card | 240 5% 10% | same |
| --primary | 263 70% 58% (#7c3aed) | same |
| --accent | 263 70% 58% (purple, same as primary) | same |
| --border | 240 5% 18% | same |
| --muted | 240 5% 15% | same |
| --muted-foreground | 240 5% 55% | same |

- The app will be dark-only (remove .dark block, make root dark)
- Remove the light mode variables entirely
- Update sidebar variables to match dark theme
- Keep flat-card, flat-nav, flat-input utilities but with dark colors

## 2. Auth Page (src/pages/Auth.tsx)

- Update background to solid `bg-[#0b0b0e]`
- Auth card: dark card background (`bg-[#14141a]`), subtle border
- Tab toggle: dark muted background
- Sign In button: purple (`bg-[#7c3aed]`)
- Inputs: dark backgrounds with visible borders
- "Forgot your password?" link stays visible
- Keep all existing logic (forgot password, signup, demo bypass)

## 3. Dashboard (src/components/PatientDashboard.tsx)

- Dark header bar with "System Operational" green dot indicator
- Purple "+ New Case" button in header (replaces floating FAB)
- Stats cards: dark card backgrounds
- Patient table: dark rows with hover states
- Keep all existing data/logic

## 4. Case Sheet Form (src/components/case-sheet/CaseSheetForm.tsx)

- Left sidebar: deep dark (#0b0b0e)
- Active step: purple background (#7c3aed)
- Main content area: slightly lighter dark (#14141a)
- Footer bar: dark with purple "Next Step" button
- Keep all existing steps and form logic unchanged

## 5. Admin Dashboard - Global Case View (src/pages/AdminDashboard.tsx)

Add a new "All Cases" tab that fetches ALL patients across all users:

- New query in useAdmin hook: `useAllPatients()` that fetches from patients table (admin RLS allows viewing all)
- Display table with columns: Patient Name, Age, Doctor (from profiles join), Chief Complaint, Created Date
- Add a "User Filter" dropdown to filter by doctor
- Keep existing user management tabs

### Database changes needed:
- Add a PERMISSIVE SELECT policy on `patients` table for admins: `has_role(auth.uid(), 'admin')` so admins can see all patients
- Same for `profiles` table (already has admin SELECT policy)

## 6. RLS Policy Update (Database Migration)

```sql
-- Allow admins to see ALL patients
CREATE POLICY "Admins can view all patients"
ON public.patients FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to see ALL treatment_plans
CREATE POLICY "Admins can view all treatment_plans"
ON public.treatment_plans FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to see ALL sessions
CREATE POLICY "Admins can view all sessions"
ON public.sessions FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
```

## 7. Login Loop Fix (src/pages/Auth.tsx)

- After successful `signInWithPassword`, use `window.location.href` instead of `navigate()` for a hard redirect to force full state refresh
- This prevents the "Signing in..." stuck state

## 8. Remove Theme Toggle

- Remove `ThemeToggle` component usage since app is dark-only
- Remove `useTheme` hook references

## 9. Other Pages

Update all remaining pages to work with dark theme:
- `AdminDashboard.tsx` - dark backgrounds
- `EditPatient.tsx` - dark form backgrounds
- `CaseManagement.tsx` - dark theme
- `ResetPassword.tsx` - dark auth card
- `ProtectedRoute.tsx` - dark loading screen
- `PatientProfile.tsx` - dark profile cards

## 10. Admin Credentials Note

Cannot directly set passwords in the database (auth schema is managed by the platform). The admin should use the "Forgot Password" flow to reset to their desired password. The admin role for `kararalkhafaji892@gmail.com` is already confirmed in the database.

---

## Files to modify:
1. `src/index.css` - Dark theme variables
2. `tailwind.config.ts` - Remove light-mode related config
3. `src/pages/Auth.tsx` - Dark styling + hard redirect fix
4. `src/components/PatientDashboard.tsx` - Dark dashboard + system status + purple New Case button
5. `src/components/case-sheet/CaseSheetForm.tsx` - Dark sidebar styling
6. `src/pages/AdminDashboard.tsx` - Add Global Case View tab
7. `src/hooks/useAdmin.ts` - Add `useAllPatients` query for admin
8. `src/components/ProtectedRoute.tsx` - Dark loading
9. `src/pages/ResetPassword.tsx` - Dark styling
10. `src/pages/EditPatient.tsx` - Dark styling
11. `src/pages/CaseManagement.tsx` - Dark styling
12. `src/hooks/useTheme.ts` - Simplify (always dark)
13. Database migration - Admin RLS policies for patients, treatment_plans, sessions

## Content Preservation
All form fields, data structures, clinical steps, and diagnosis logic remain completely unchanged. Only visual styling is updated.

