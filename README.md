# RoundBuy Admin Panel

Comprehensive admin dashboard for managing the RoundBuy C2C marketplace platform.

## Features

### 1. **Dashboard**
- Overview statistics (users, ads, revenue)
- Recent activities
- Charts and analytics
- Quick

 actions

### 2. **User Management**
- List all users (subscribers, editors, admins)
- Create/Edit user roles
- Ban/Unban users
- View user details and activity
- User verification
- Search and filters

### 3. **Subscription Plans**
- View all subscription tiers
- Create/Edit/Delete plans
- Configure features per plan
- Set pricing and duration
- Manage plan limits

### 4. **Advertisement Plans**
- Manage ad pricing plans
- Link plans to subscription tiers
- Set duration and features
- Configure pricing

### 5. **Banner Plans**
- Manage banner placement options
- Configure pricing per placement
- Set dimensions and limits
- Link to subscription plans

### 6. **Advertisements**
- View all user advertisements
- Approve/Reject ads
- Edit ad details
- Change status (pending/published/expired)
- Auto-expiry management
- Search and filter
- Bulk actions

### 7. **Banner Ads**
- View all banner ads
- Approve/Reject banners
- Edit banner details
- Manage placements
- Track impressions/clicks
- Status management

### 8. **Subscriptions**
- View all user subscriptions
- Manage expiry dates
- Extend subscriptions
- View subscription history
- Send renewal reminders

### 9. **Languages**
- Add/Edit/Delete languages
- View translations
- Auto-translate with Google Translate
- Manual translation override
- Export/Import translations

### 10. **General Settings**
- **App Settings**: Name, timezone, currency
- **API Keys**: Google Maps, Stripe, PayPal, AI integrations
- **Email/SMTP**: Email configuration
- **Payment Gateways**: Stripe, Razorpay settings
- **Notifications**: Push, email, SMS settings
- **Chat API**: Real-time messaging config
- **Other**: Various system settings

### 11. **Moderation Manager**
- Word filter management
- Add/Edit/Remove banned words
- Set severity levels
- View moderation queue
- Review flagged content
- Approve/Reject content

### 12. **API Manager**
- View all API endpoints
- See request/response logs
- Monitor API usage
- Rate limit configuration
- API documentation viewer
- JSON data inspection

## Tech Stack

- **React 18** - UI library
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Charts and analytics
- **React Hook Form** - Form management
- **React Toastify** - Notifications
- **TanStack Table** - Data tables
- **React JSON View** - JSON viewer
- **Vite** - Build tool

## Project Structure

```
admin-panel/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopBar.jsx
│   │   │   └── Footer.jsx
│   │   ├── Common/
│   │   │   ├── DataTable.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ConfirmDialog.jsx
│   │   └── Forms/
│   │       ├── UserForm.jsx
│   │       ├── PlanForm.jsx
│   │       └── SettingsForm.jsx
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── Users/
│   │   │   ├── UserList.jsx
│   │   │   ├── UserDetail.jsx
│   │   │   └── UserForm.jsx
│   │   ├── Plans/
│   │   │   ├── SubscriptionPlans.jsx
│   │   │   ├── AdvertisementPlans.jsx
│   │   │   └── BannerPlans.jsx
│   │   ├── Content/
│   │   │   ├── Advertisements.jsx
│   │   │   ├── Banners.jsx
│   │   │   └── ContentDetail.jsx
│   │   ├── Subscriptions/
│   │   │   └── SubscriptionList.jsx
│   │   ├── Languages/
│   │   │   ├── LanguageList.jsx
│   │   │   └── TranslationEditor.jsx
│   │   ├── Settings/
│   │   │   ├── GeneralSettings.jsx
│   │   │   ├── APISettings.jsx
│   │   │   ├── EmailSettings.jsx
│   │   │   └── PaymentSettings.jsx
│   │   ├── Moderation/
│   │   │   ├── ModerationWords.jsx
│   │   │   └── ModerationQueue.jsx
│   │   ├── API/
│   │   │   ├── APILogs.jsx
│   │   │   └── APIEndpoints.jsx
│   │   └── Auth/
│   │       └── Login.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── plan.service.js
│   │   └── settings.service.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── utils/
│   │   ├── helpers.js
│   │   └── constants.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

## Installation

```bash
cd admin-panel

# Install dependencies
npm install

# Start development server
npm run dev
```

The admin panel will be available at: `http://localhost:3000`

## Configuration

### API Connection

Edit `src/services/api.js`:

```javascript
export const API_BASE_URL = 'http://localhost:5001/api/v1';
```

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:5001/api/v1
VITE_APP_NAME=RoundBuy Admin
```

## Usage

### 1. Login

Navigate to `http://localhost:3000` and login with admin credentials:

- Email: admin@roundbuy.com
- Password: (set during user creation)

### 2. Dashboard

After login, you'll see:
- Total users, ads, revenue statistics
- Recent activity feed
- Charts showing trends
- Quick action buttons

### 3. User Management

**View Users:**
- Navigate to Users → User List
- See all users with search/filter
- Sort by role, status, date joined

**Edit User:**
- Click on user row
- Edit details, change role
- Ban/unban user
- View activity history

**Create User:**
- Click "Add User" button
- Fill in user details
- Assign role
- Save

### 4. Subscription Plans

**Manage Plans:**
- View all plans (Free, Basic, Premium, Enterprise)
- Edit pricing and features
- Set limits (max_ads, max_banners, etc.)
- Activate/Deactivate plans

**Features per Plan:**
```json
{
  "max_ads": 10,
  "max_banners": 2,
  "featured_ads": 1,
  "support_priority": "high",
  "analytics": true,
  "verification_badge": true
}
```

### 5. Advertisement Management

**View All Ads:**
- List view with filters
- Status: Draft, Pending, Published, Expired
- Bulk actions available

**Approve Ad:**
- Click on ad → Review details
- Click "Approve" button
- Ad becomes published

**Reject Ad:**
- Click on ad → Review details
- Enter rejection reason
- Click "Reject"
- User gets notified

**Edit Ad:**
- Modify title, description, price
- Change category
- Update images
- Save changes

### 6. Banner Management

Similar to advertisements but with:
- Placement selection
- Dimension settings
- Click/impression stats
- Position priority

### 7. Subscription Management

**View Subscriptions:**
- All user subscriptions
- Status: Active, Expired, Cancelled
- Expiry dates

**Actions:**
- Extend subscription
- Change plan
- Cancel subscription
- Send reminder

### 8. Language Management

**Add Language:**
- Enter language name and code
- Optionally auto-translate from English
- Activate language

**Edit Translations:**
- Select language
- View all translation keys
- Modify translations
- Save changes

**Auto-translate:**
- Uses Google Translate API
- Can be overridden manually
- Batch translate option

### 9. General Settings

**App Settings:**
- App name, logo
- Timezone
- Currency
- Items per page

**API Keys:**
- Google Maps API key
- Stripe keys (public/secret)
- PayPal credentials
- AI service keys
- SMS gateway

**Email Settings:**
- SMTP host, port
- Username, password
- From email
- Email templates

**Payment Settings:**
- Enable/disable gateways
- Test mode toggle
- Webhook URLs
- Commission rates

### 10. Moderation

**Word Management:**
- Add banned words
- Set severity (low/medium/high/critical)
- Category (offensive/spam/inappropriate)
- Bulk import

**Moderation Queue:**
- View flagged content
- Review and approve/reject
- Add notes
- Take action

### 11. API Manager

**View Logs:**
- All API requests
- Filter by endpoint, method, status
- View request/response JSON
- Export logs

**API Documentation:**
- List all endpoints
- View parameters
- See example requests/responses
- Test endpoints

## Development

### Adding a New Page

1. Create page component in `src/pages/[Category]/`
2. Add route in `App.jsx`
3. Add menu item in `Sidebar.jsx`
4. Create service functions in `src/services/`

Example:

```jsx
// src/pages/Reports/SalesReport.jsx
import React from 'react';

function SalesReport() {
  return (
    <div>
      <h1>Sales Report</h1>
      {/* Component content */}
    </div>
  );
}

export default SalesReport;
```

### API Integration

```javascript
// src/services/user.service.js
import api from './api';

export const userService = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
  ban: (id) => api.put(`/admin/users/${id}/ban`),
  unban: (id) => api.put(`/admin/users/${id}/unban`),
};
```

## Security

- JWT token stored in localStorage
- Auto-refresh on expiry
- Role-based access control
- Protected routes
- API request authentication

## Build for Production

```bash
npm run build
```

Output in `dist/` directory.

Deploy to:
- Vercel
- Netlify  
- AWS S3 + CloudFront
- Your own server

## Common Tasks

### Change API URL

Edit `src/services/api.js`:
```javascript
const API_BASE_URL = 'https://api.yourdomain.com/api/v1';
```

### Add New Admin User

Use backend API or database:
```sql
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('admin@example.com', '$2b$10$...', 'Admin User', 'admin');
```

### Export Data

Most pages have "Export" button to download CSV/Excel.

## Troubleshooting

### Can't Login
- Check backend is running
- Verify API URL is correct
- Check admin user exists with correct role

### API Errors
- Open browser console
- Check Network tab
- Verify backend logs

### Build Errors
- Delete `node_modules`
- Run `npm install`
- Try `npm run build` again

## Future Enhancements

- [ ] Real-time notifications with WebSocket
- [ ] Advanced analytics dashboard
- [ ] Bulk operations for content
- [ ] Activity timeline for users
- [ ] Email template editor
- [ ] Report generator
- [ ] Mobile responsive design improvements
- [ ] Dark mode
- [ ] Multi-language admin panel
- [ ] Export/Import data tools

## Support

For issues or questions:
1. Check documentation
2. Review error messages
3. Check backend logs
4. Create issue with details

---

**Admin Panel Ready for Development!** 🚀

This structure provides all the features you requested. Implementation can proceed page by page, starting with essential features and expanding.