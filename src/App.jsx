import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Auth/Login';
import Debug from './pages/Auth/Debug';
import Dashboard from './pages/Dashboard/Dashboard';
import MarketplaceDashboard from './pages/Dashboard/MarketplaceDashboard';
import TrafficAnalyticsPage from './pages/Dashboard/TrafficAnalyticsPage';
import SellerMetricsPage from './pages/SellerMetricsPage';
import OnboardingAnalyticsScreen from './pages/OnboardingAnalyticsScreen';
import UserList from './pages/Users/UserList';
import SubscriptionPlans from './pages/Plans/SubscriptionPlans';
import AdvertisementPlans from './pages/Plans/AdvertisementPlans';
import BannerPlans from './pages/Plans/BannerPlans';
import Advertisements from './pages/Content/Advertisements';
import Banners from './pages/Content/Banners';
import Categories from './pages/Content/Categories';
import AdActivities from './pages/Content/AdActivities';
import AdConditions from './pages/Content/AdConditions';
import AdAges from './pages/Content/AdAges';
import AdGenders from './pages/Content/AdGenders';
import AdSizes from './pages/Content/AdSizes';
import AdColors from './pages/Content/AdColors';
import DemoAdvertisements from './pages/Content/DemoAdvertisements';
import SubscriptionList from './pages/Subscriptions/SubscriptionList';
import LanguageList from './pages/Languages/LanguageList';
import TranslationManager from './pages/Languages/TranslationManager';
import GeneralSettings from './pages/Settings/GeneralSettings';
import CurrencyList from './pages/Settings/CurrencyList';
import CountryList from './pages/Settings/CountryList';
import ModerationWords from './pages/Moderation/ModerationWords';
import APILogs from './pages/API/APILogs';
import KYCManagement from './pages/KYC/KYCManagement';
import PostageManagement from './pages/Postage/PostageManagement';

// Resolution & Support
import IssuesManagement from './pages/Resolution/IssuesManagement';
import IssueDetail from './pages/Resolution/IssueDetail';
import DisputesManagement from './pages/Resolution/DisputesManagement';

// Rewards
import RewardsPage from './pages/Rewards/RewardsPage';
import ReferralsPage from './pages/Rewards/ReferralsPage';
import LotteryPage from './pages/Rewards/LotteryPage';
import LevelRewardsPage from './pages/Rewards/LevelRewardsPage';

// Notifications
import NotificationList from './pages/Notifications/NotificationList';
import NotificationForm from './pages/Notifications/NotificationForm';
import NotificationStats from './pages/Notifications/NotificationStats';
import CampaignNotifications from './pages/Notifications/CampaignNotifications';
import CampaignNotificationEdit from './pages/Notifications/CampaignNotificationEdit';
import CampaignNotificationStats from './pages/Notifications/CampaignNotificationStats';

// FAQ Management
import FAQManagement from './pages/FAQManagement';

// Messages
import Messages from './pages/Messages/Messages';
import Suggestions from './pages/Suggestions/Suggestions';
import EventsManagement from './pages/Events/EventsManagement';
import TrendingManagement from './pages/Trending/TrendingManagement';

// Wallets
import WalletReports from './pages/Wallets/WalletReports';
import WithdrawalRequests from './pages/Wallets/WithdrawalRequests';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Wrapper (for login page)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Debug page - accessible without auth */}
            <Route path="/debug" element={<Debug />} />

            {/* Protected Routes with Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <AdminLayout />
                  </SidebarProvider>
                </ProtectedRoute>
              }
            >
              {/* Dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="marketplace-dashboard" element={<MarketplaceDashboard />} />
              <Route path="marketplace/traffic" element={<TrafficAnalyticsPage />} />
              <Route path="seller-metrics" element={<SellerMetricsPage />} />
              <Route path="analytics/onboarding" element={<OnboardingAnalyticsScreen />} />

              {/* User Management */}
              <Route path="users" element={<UserList />} />

              {/* Plans Management */}
              <Route path="plans/subscriptions" element={<SubscriptionPlans />} />
              <Route path="plans/advertisements" element={<AdvertisementPlans />} />
              <Route path="plans/banners" element={<BannerPlans />} />

              {/* Content Management */}
              <Route path="content/advertisements" element={<Advertisements />} />
              <Route path="content/banners" element={<Banners />} />
              <Route path="content/demo-advertisements" element={<DemoAdvertisements />} />
              <Route path="content/categories" element={<Categories />} />
              <Route path="content/ad-activities" element={<AdActivities />} />
              <Route path="content/ad-conditions" element={<AdConditions />} />
              <Route path="content/ad-ages" element={<AdAges />} />
              <Route path="content/ad-genders" element={<AdGenders />} />
              <Route path="content/ad-sizes" element={<AdSizes />} />
              <Route path="content/ad-colors" element={<AdColors />} />
              <Route path="events" element={<EventsManagement />} />
              <Route path="trending" element={<TrendingManagement />} />
              <Route path="kyc" element={<KYCManagement />} />
              <Route path="postage" element={<PostageManagement />} />

              {/* Rewards */}
              <Route path="rewards" element={<RewardsPage />} />
              <Route path="rewards/referrals" element={<ReferralsPage />} />
              <Route path="rewards/lottery" element={<LotteryPage />} />
              <Route path="rewards/level-options" element={<LevelRewardsPage />} />

              {/* Subscriptions */}
              <Route path="subscriptions" element={<SubscriptionList />} />

              {/* Settings */}
              <Route path="settings" element={<GeneralSettings />} />
              <Route path="settings/currencies" element={<CurrencyList />} />
              <Route path="settings/countries" element={<CountryList />} />
              <Route path="languages" element={<LanguageList />} />
              <Route path="languages/translations" element={<TranslationManager />} />

              {/* Moderation */}
              <Route path="moderation/words" element={<ModerationWords />} />

              {/* API Manager */}
              <Route path="api/logs" element={<APILogs />} />

              {/* Resolution & Support */}
              <Route path="resolution/issues" element={<IssuesManagement />} />
              <Route path="resolution/issues/:id" element={<IssueDetail />} />
              <Route path="resolution/disputes" element={<DisputesManagement />} />

              {/* Notifications */}
              <Route path="notifications" element={<NotificationList />} />
              <Route path="notifications/create" element={<NotificationForm />} />
              <Route path="notifications/:id/edit" element={<NotificationForm />} />
              <Route path="notifications/:id/stats" element={<NotificationStats />} />

              {/* Campaign Notifications */}
              <Route path="notifications/campaigns" element={<CampaignNotifications />} />
              <Route path="notifications/campaigns/:id" element={<CampaignNotificationEdit />} />
              <Route path="notifications/campaigns/:id/stats" element={<CampaignNotificationStats />} />

              {/* Messages */}
              <Route path="messages" element={<Messages />} />

              {/* Suggestions */}
              <Route path="suggestions" element={<Suggestions />} />

              {/* FAQ Management */}
              <Route path="faqs" element={<FAQManagement />} />

              {/* Wallets */}
              <Route path="wallets/reports" element={<WalletReports />} />
              <Route path="wallets/withdrawals" element={<WithdrawalRequests />} />
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;