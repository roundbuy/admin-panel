import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import UserList from './pages/Users/UserList';
import SubscriptionPlans from './pages/Plans/SubscriptionPlans';
import AdvertisementPlans from './pages/Plans/AdvertisementPlans';
import BannerPlans from './pages/Plans/BannerPlans';
import Advertisements from './pages/Content/Advertisements';
import Banners from './pages/Content/Banners';
import SubscriptionList from './pages/Subscriptions/SubscriptionList';
import LanguageList from './pages/Languages/LanguageList';
import GeneralSettings from './pages/Settings/GeneralSettings';
import ModerationWords from './pages/Moderation/ModerationWords';
import APILogs from './pages/API/APILogs';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
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
            <Route path="/login" element={<Login />} />

            {/* Protected Routes with Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* User Management */}
              <Route path="users" element={<UserList />} />
              
              {/* Plans Management */}
              <Route path="plans/subscriptions" element={<SubscriptionPlans />} />
              <Route path="plans/advertisements" element={<AdvertisementPlans />} />
              <Route path="plans/banners" element={<BannerPlans />} />
              
              {/* Content Management */}
              <Route path="content/advertisements" element={<Advertisements />} />
              <Route path="content/banners" element={<Banners />} />
              
              {/* Subscriptions */}
              <Route path="subscriptions" element={<SubscriptionList />} />
              
              {/* Languages */}
              <Route path="languages" element={<LanguageList />} />
              
              {/* Settings */}
              <Route path="settings" element={<GeneralSettings />} />
              
              {/* Moderation */}
              <Route path="moderation/words" element={<ModerationWords />} />
              
              {/* API Manager */}
              <Route path="api/logs" element={<APILogs />} />
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