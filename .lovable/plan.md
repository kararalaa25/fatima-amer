

# Testing Results & Fix Plan for Auth Loading Issue

## Investigation Findings

I tested the signup flow by navigating to `/auth` and found the page is stuck on a loading spinner indefinitely. This is the `checkingSession` state in `Auth.tsx` (line 185-193), which waits for `supabase.auth.getSession()` to resolve before showing the login form.

### Root Cause
The `Auth.tsx` `checkingSession` flow has no timeout or error handling. If `getSession()` is slow or hangs (network issues, cold starts), the user sees an infinite spinner instead of the login form.

### What's Already Working
- The database trigger `handle_new_user()` correctly sets `is_activated = true` and assigns the `doctor` role on signup
- All existing users have been activated via migration
- The login flow correctly fetches profile and roles in parallel

## Plan

### 1. Add timeout to session check in Auth.tsx
Add a safety timeout (3 seconds) so that if `getSession()` doesn't resolve, the auth form is still shown. Also wrap the call in a try/catch to handle errors gracefully.

### 2. Add timeout to useAuth hook loading state
Same pattern in the `useAuth` hook -- if the auth state check takes too long, set `loading` to false so `ProtectedRoute` doesn't show an infinite spinner.

### 3. Fix PageTransition ref warning
The `PageTransition` component receives a `key` prop in `App.tsx` which causes React ref warnings. The fix is to move the `key` to a wrapper element or remove the redundant `key` from PageTransition's internal div.

### Technical Details

**Auth.tsx change** (lines 51-56):
```typescript
// Add timeout to prevent infinite loading
const sessionTimeout = setTimeout(() => setCheckingSession(false), 3000);
supabase.auth.getSession().then(async ({ data: { session } }) => {
  clearTimeout(sessionTimeout);
  if (session) {
    await redirectIfAuthenticated(session.user.id);
  }
  setCheckingSession(false);
}).catch(() => {
  clearTimeout(sessionTimeout);
  setCheckingSession(false);
});
```

**useAuth.ts change** (add timeout):
```typescript
// Add safety timeout for loading state
const loadingTimeout = setTimeout(() => setLoading(false), 5000);
// Clear in both getSession and onAuthStateChange callbacks
```

**App.tsx change** (line 24): Remove the `key` prop from PageTransition to fix the ref warning.

