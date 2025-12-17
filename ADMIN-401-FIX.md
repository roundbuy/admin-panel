# Admin Panel - 401 Error Fix 🔐

## Problem:

**Error:** `GET /api/v1/admin/dashboard 401 Unauthorized`

**Cause:** You're not logged in to the admin panel. The admin routes require authentication with admin/editor role.

## Solution:

### Step 1: Access the Login Page

The admin panel should redirect you to `/login` automatically when you're not authenticated.

**URL:** `http://localhost:5173/login` (or whatever port Vite is running on)

### Step 2: Login with Admin Credentials

You need to login with an account that has `admin` or `editor` role.

**Default Admin Account (if seeded):**
- Email: `admin@roundbuy.com`
- Password: `admin123` (or whatever was set in your seed data)

### Step 3: Check if Admin User Exists

If you don't have an admin user, you need to create one in the database:

```sql
-- Check if admin user exists
SELECT * FROM users WHERE role = 'admin';

-- If no admin exists, update an existing user to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Or create a new admin user
INSERT INTO users (email, password, first_name, last_name, role, status)
VALUES (
  'admin@roundbuy.com',
  '$2b$10$...',  -- You'll need to hash the password
  'Admin',
  'User',
  'admin',
  'active'
);
```

## Authentication Flow:

### 1. Login Process
```
User enters credentials
    ↓
POST /api/v1/auth/login
    ↓
Backend validates credentials
    ↓
Returns: { user, accessToken }
    ↓
Frontend stores in localStorage
    ↓
Redirects to /dashboard
```

### 2. Dashboard Access
```
User navigates to /dashboard
    ↓
Frontend sends GET /api/v1/admin/dashboard
    ↓
Includes: Authorization: Bearer <token>
    ↓
Backend validates token & role
    ↓
Returns dashboard data
```

## How to Fix:

### Option 1: Login Through UI (Recommended)

1. Open admin panel: `http://localhost:5173`
2. You should see the login page
3. Enter admin credentials
4. Click "Login"
5. You'll be redirected to dashboard

### Option 2: Create Admin User via Backend

If you don't have admin credentials, create one:

```bash
# Connect to MySQL
mysql -u root -p roundbuy

# Create admin user
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
  '$2b$10$YourHashedPasswordHere',  -- Use bcrypt to hash
  'Admin',
  'User',
  'admin',
  'active',
  NOW(),
  NOW()
);
```

### Option 3: Use Existing User

If you have a regular user account, upgrade it to admin:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-existing-email@example.com';
```

## Admin Panel Routes:

All these routes require authentication:

| Route | Method | Description |
|-------|--------|-------------|
| `/admin/dashboard` | GET | Dashboard stats |
| `/admin/users` | GET | List users |
| `/admin/advertisements` | GET | List ads |
| `/admin/subscription-plans` | GET | List plans |
| `/admin/settings` | GET | App settings |

## Authentication Requirements:

### Required Headers:
```javascript
Authorization: Bearer <accessToken>
```

### Required Role:
- `admin` - Full access
- `editor` - Limited access (can't delete)

### Token Storage:
- Stored in: `localStorage.getItem('accessToken')`
- Auto-added by axios interceptor

## Debugging:

### Check if Token Exists:
```javascript
// Open browser console
localStorage.getItem('accessToken')
localStorage.getItem('user')
```

### Check Token Validity:
```javascript
// Decode JWT token
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
```

### Clear Auth and Re-login:
```javascript
localStorage.removeItem('accessToken');
localStorage.removeItem('user');
window.location.reload();
```

## Quick Fix Commands:

### 1. Start Admin Panel:
```bash
cd admin-panel
npm run dev
```

### 2. Access Login:
```
http://localhost:5173/login
```

### 3. Login with Admin Credentials

### 4. Access Dashboard:
```
http://localhost:5173/dashboard
```

## Common Issues:

### Issue 1: No Admin User
**Solution:** Create one in database or upgrade existing user

### Issue 2: Wrong Credentials
**Solution:** Reset password in database or use correct credentials

### Issue 3: Token Expired
**Solution:** Clear localStorage and login again

### Issue 4: Wrong Role
**Solution:** Update user role to 'admin' in database

## Summary:

The 401 error is **expected** when you're not logged in. Simply:

1. ✅ Go to login page
2. ✅ Enter admin credentials
3. ✅ Login
4. ✅ Access dashboard

If you don't have admin credentials, create an admin user in the database first!

## Need Help?

If you need to create an admin user, let me know and I can help you:
1. Hash a password
2. Create SQL insert statement
3. Or create a seed script

The admin panel is working correctly - you just need to login! 🔐
