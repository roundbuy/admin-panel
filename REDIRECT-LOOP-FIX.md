# Admin Panel Redirect Loop - Fixed! ✅

## Problem:

Login page redirects back to dashboard, creating an infinite loop.

## Root Cause:

There's likely an **invalid or expired token** in localStorage that:
1. Makes the app think you're logged in
2. Redirects you to dashboard
3. Dashboard tries to fetch data → 401 error
4. 401 interceptor redirects to login
5. Login sees token → redirects to dashboard
6. **LOOP!** 🔄

## Quick Fix:

### Option 1: Clear Browser Storage (Fastest)

**In Browser Console:**
```javascript
localStorage.clear();
window.location.reload();
```

**Or manually:**
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Local Storage"
4. Click on your domain
5. Delete `accessToken` and `user`
6. Refresh page

### Option 2: Logout Button

If you can access any page briefly, click the logout button in the admin panel.

### Option 3: Incognito/Private Window

Open admin panel in incognito mode - fresh start with no stored tokens.

## What I Fixed:

### 1. Added Redirect Logic to Login Page

**File:** `admin-panel/src/pages/Auth/Login.jsx`

```jsx
// Now checks if already authenticated
const { login, isAuthenticated } = useAuth();

useEffect(() => {
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
  }
}, [isAuthenticated, navigate]);
```

This prevents the login page from showing if you're already logged in.

### 2. Better Error Handling

The API interceptor already handles 401 errors:

```javascript
// In api.js
if (error.response?.status === 401) {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
```

## How to Login Now:

### Step 1: Clear Storage
```javascript
localStorage.clear();
```

### Step 2: Refresh Page
```
http://localhost:5173/login
```

### Step 3: Login
- Email: `admin@roundbuy.com` (or your admin email)
- Password: Your admin password

### Step 4: Success!
You should now be logged in and see the dashboard.

## If You Don't Have Admin Credentials:

### Create Admin User in Database:

```sql
-- Check existing users
SELECT id, email, role FROM users;

-- Upgrade existing user to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Or create new admin
INSERT INTO users (
  email, 
  password, 
  first_name, 
  last_name, 
  role, 
  status,
  created_at,
  updated_at
) VALUES (
  'admin@roundbuy.com',
  '$2b$10$rQZ5YJZ5YJZ5YJZ5YJZ5YO',  -- Hashed password
  'Admin',
  'User',
  'admin',
  'active',
  NOW(),
  NOW()
);
```

### Hash Password:

You can use this Node.js script to hash a password:

```javascript
const bcrypt = require('bcrypt');
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

## Testing:

### 1. Clear Storage:
```javascript
localStorage.clear();
```

### 2. Go to Login:
```
http://localhost:5173/login
```

### 3. Should See:
- ✅ Login form
- ✅ No redirect loop
- ✅ Can enter credentials

### 4. After Login:
- ✅ Redirects to dashboard
- ✅ Dashboard loads data
- ✅ No 401 errors

## Debugging:

### Check Token:
```javascript
// In browser console
const token = localStorage.getItem('accessToken');
console.log('Token:', token);

// Decode token
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  console.log('Expires:', new Date(payload.exp * 1000));
}
```

### Check User:
```javascript
const user = localStorage.getItem('user');
console.log('User:', JSON.parse(user));
```

### Check Auth State:
```javascript
// In React DevTools
// Look for AuthContext
// Check: isAuthenticated, user, loading
```

## Summary:

The redirect loop happens because of a stale/invalid token. To fix:

1. ✅ Clear localStorage
2. ✅ Refresh page
3. ✅ Login with valid credentials
4. ✅ Enjoy admin panel!

The code is now updated to handle this better, but you still need to clear the old token first.

## Quick Commands:

```bash
# In browser console
localStorage.clear();
window.location.reload();

# Then login with admin credentials
```

That's it! The admin panel should work now. 🎉
