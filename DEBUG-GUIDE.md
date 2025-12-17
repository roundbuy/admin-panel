# Admin Panel Debug Guide 🔍

## Quick Fix - Use Debug Page

I've created a debug page to help diagnose and fix the issue.

### Step 1: Access Debug Page

**URL:** `http://localhost:5173/debug`

This page will show you:
- ✅ Whether you have a token
- ✅ If the token is expired
- ✅ User data in localStorage
- ✅ Quick fix buttons

### Step 2: Use the Debug Page

The debug page has a button: **"Clear Storage & Go to Login"**

Click it to:
1. Clear all localStorage
2. Automatically redirect to login
3. Fix the redirect loop

## What I Fixed:

### 1. Added PublicRoute Wrapper

**File:** `admin-panel/src/App.jsx`

```jsx
// Public Route Wrapper (for login page)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Login route now uses PublicRoute
<Route 
  path="/login" 
  element={
    <PublicRoute>
      <Login />
    </PublicRoute>
  } 
/>
```

This prevents the login page from showing if you have a token.

### 2. Created Debug Page

**File:** `admin-panel/src/pages/Auth/Debug.jsx`

Shows:
- Token status (exists, expired, valid)
- Token payload (user ID, role, expiration)
- User data
- Quick action buttons

### 3. Simplified Login Component

Removed the redirect logic from Login.jsx since it's now handled by PublicRoute.

## How to Use:

### Option 1: Debug Page (Recommended)

1. Go to: `http://localhost:5173/debug`
2. Check the diagnosis
3. Click "Clear Storage & Go to Login"
4. Login with credentials
5. Done! ✅

### Option 2: Manual Clear

**In Browser Console:**
```javascript
localStorage.clear();
window.location.href = '/login';
```

### Option 3: Direct URL

Try accessing login directly:
```
http://localhost:5173/login
```

If it redirects, you have a token. Use Option 1 or 2.

## Understanding the Issue:

### The Redirect Loop:

```
1. User has expired/invalid token in localStorage
   ↓
2. PublicRoute sees token → redirects to /dashboard
   ↓
3. Dashboard tries to load → 401 error (token invalid)
   ↓
4. API interceptor sees 401 → redirects to /login
   ↓
5. PublicRoute sees token → redirects to /dashboard
   ↓
6. LOOP! 🔄
```

### The Fix:

Clear the token so PublicRoute doesn't redirect:

```
1. Clear localStorage (no token)
   ↓
2. PublicRoute sees no token → shows login page ✅
   ↓
3. User logs in → gets new valid token
   ↓
4. Redirects to dashboard → loads successfully ✅
```

## Testing:

### Test 1: No Token
```javascript
localStorage.clear();
// Go to /login
// Should show: Login form ✅
```

### Test 2: Valid Token
```javascript
// Login successfully
// Go to /login
// Should redirect to: /dashboard ✅
```

### Test 3: Expired Token
```javascript
// Set expired token
localStorage.setItem('accessToken', 'expired-token');
// Go to /debug
// Should show: "Token expired" ❌
// Click: "Clear Storage & Go to Login"
// Should redirect to: /login ✅
```

## Debug Page Features:

### Authentication Status Card
- Shows if token exists
- Shows if token is expired
- Shows token details (user ID, role, expiration)

### User Data Card
- Shows full user object from localStorage
- Formatted JSON for easy reading

### Actions Card
- **Clear Storage & Go to Login** - Main fix button
- **Go to Login** - Navigate to login
- **Go to Dashboard** - Navigate to dashboard
- **Reload Page** - Refresh the page

### Diagnosis Card
- ✅ No token - Login should work
- ✅ Valid token - Dashboard should work
- ❌ Expired token - Causes redirect loop (use clear button)

## Common Scenarios:

### Scenario 1: First Time User
```
No token → Login page works → Enter credentials → Success ✅
```

### Scenario 2: Logged In User
```
Valid token → Redirects to dashboard → Dashboard loads ✅
```

### Scenario 3: Expired Session
```
Expired token → Redirect loop ❌
Solution: Go to /debug → Clear storage → Login ✅
```

### Scenario 4: Invalid Token
```
Invalid token → 401 errors ❌
Solution: Go to /debug → Clear storage → Login ✅
```

## Quick Commands:

### Access Debug Page:
```
http://localhost:5173/debug
```

### Clear Storage (Console):
```javascript
localStorage.clear();
window.location.reload();
```

### Check Token (Console):
```javascript
const token = localStorage.getItem('accessToken');
console.log('Token:', token);

if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Payload:', payload);
  console.log('Expires:', new Date(payload.exp * 1000));
  console.log('Is Expired:', new Date(payload.exp * 1000) < new Date());
}
```

## Summary:

1. ✅ Go to `http://localhost:5173/debug`
2. ✅ Click "Clear Storage & Go to Login"
3. ✅ Enter admin credentials
4. ✅ Login successful!

The debug page makes it super easy to diagnose and fix authentication issues. No more redirect loops! 🎉

## Need Admin Credentials?

If you don't have admin credentials, run this SQL:

```sql
-- Check existing users
SELECT id, email, role FROM users;

-- Upgrade user to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Then use those credentials to login!
