import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert
} from '@mui/material';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const GeneralSettings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSettings({});
      const settingsObj = {};
      response.data.data.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });
      setSettings(settingsObj);
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const settingsArray = Object.keys(settings).map(key => ({
        setting_key: key,
        setting_value: settings[key]
      }));
      await adminService.bulkUpdateSettings(settingsArray);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>General Settings</Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="General" />
          <Tab label="Email" />
          <Tab label="Payment" />
          <Tab label="Notifications" />
          <Tab label="Pickup Fees" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="App Name"
                value={settings.app_name || ''}
                onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Timezone"
                value={settings.timezone || ''}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Currency"
                value={settings.currency || ''}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Items Per Page"
                value={settings.items_per_page || ''}
                onChange={(e) => setSettings({ ...settings, items_per_page: e.target.value })}
              />
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>SMTP Configuration</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="SMTP Enabled"
                value={settings.smtp_enabled || 'false'}
                onChange={(e) => setSettings({ ...settings, smtp_enabled: e.target.value })}
              />
            </Grid>
          </Grid>
        )}

        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Payment Gateway Settings</Typography>
            </Grid>

            {/* Stripe Configuration */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Stripe Configuration
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.stripe_enabled === 'true'}
                    onChange={(e) => setSettings({
                      ...settings,
                      stripe_enabled: e.target.checked ? 'true' : 'false'
                    })}
                  />
                }
                label="Enable Stripe Payments"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stripe Publishable Key"
                value={settings.stripe_publishable_key || ''}
                onChange={(e) => setSettings({ ...settings, stripe_publishable_key: e.target.value })}
                placeholder="pk_test_..."
                helperText="Your Stripe publishable key (starts with pk_)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="password"
                label="Stripe Secret Key"
                value={settings.stripe_secret_key || ''}
                onChange={(e) => setSettings({ ...settings, stripe_secret_key: e.target.value })}
                placeholder="sk_test_..."
                helperText="Your Stripe secret key (starts with sk_)"
              />
            </Grid>

            {/* Backend Tokenization Setting */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Payment Tokenization Method
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">Backend Tokenization (Recommended)</Typography>
                <Typography variant="caption">
                  Processes card details securely on your server. More secure and avoids Stripe dashboard restrictions.
                  Enable this to bypass "integration surface unsupported" errors.
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.use_backend_tokenization === 'true'}
                    onChange={(e) => setSettings({
                      ...settings,
                      use_backend_tokenization: e.target.checked ? 'true' : 'false'
                    })}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      Use Backend Tokenization
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {settings.use_backend_tokenization === 'true'
                        ? '✅ Enabled - Card details tokenized on server (Secure & Recommended)'
                        : '⚠️ Disabled - Card details tokenized on client (May require Stripe dashboard configuration)'}
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            {/* Other Payment Gateways */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Other Payment Gateways
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.razorpay_enabled === 'true'}
                    onChange={(e) => setSettings({
                      ...settings,
                      razorpay_enabled: e.target.checked ? 'true' : 'false'
                    })}
                  />
                }
                label="Enable Razorpay"
              />
            </Grid>
          </Grid>
        )}

        {tabValue === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Notification Settings</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Push Notifications"
                value={settings.push_enabled || 'true'}
                onChange={(e) => setSettings({ ...settings, push_enabled: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Notifications"
                value={settings.email_enabled || 'true'}
                onChange={(e) => setSettings({ ...settings, email_enabled: e.target.value })}
              />
            </Grid>
          </Grid>
        )}

        {tabValue === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Pickup & Safe Service Fees Configuration</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Configure the fees charged to buyers for pickup and safe service transactions.
                These fees will be automatically calculated when a buyer schedules a pickup.
              </Alert>
            </Grid>

            {/* Pickup Fee */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Pickup Fee (£)"
                value={settings.pickup_fee || '5.00'}
                onChange={(e) => setSettings({ ...settings, pickup_fee: e.target.value })}
                helperText="Fixed fee for pickup service"
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            {/* Safe Service Fee */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Safe Service Fee (£)"
                value={settings.safe_service_fee || '3.50'}
                onChange={(e) => setSettings({ ...settings, safe_service_fee: e.target.value })}
                helperText="Fixed fee for safe service and insurance"
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Additional Buyer Fees
              </Typography>
            </Grid>

            {/* Buyer Fee */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Buyer Fee (£)"
                value={settings.buyer_fee || '2.00'}
                onChange={(e) => setSettings({ ...settings, buyer_fee: e.target.value })}
                helperText="Fixed buyer service fee"
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            {/* Item Fee Percentage */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Item Fee (%)"
                value={settings.item_fee_percentage || '5.00'}
                onChange={(e) => setSettings({ ...settings, item_fee_percentage: e.target.value })}
                helperText="Percentage of offer price charged as item fee"
                inputProps={{ step: '0.1', min: '0', max: '100' }}
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="bold">Fee Calculation Example:</Typography>
                <Typography variant="caption">
                  For an offer price of £100:
                  <br />• Pickup Fee: £{settings.pickup_fee || '5.00'}
                  <br />• Safe Service Fee: £{settings.safe_service_fee || '3.50'}
                  <br />• Buyer Fee: £{settings.buyer_fee || '2.00'}
                  <br />• Item Fee ({settings.item_fee_percentage || '5'}%): £{((parseFloat(settings.item_fee_percentage || 5) / 100) * 100).toFixed(2)}
                  <br />• <strong>Total: £{(
                    parseFloat(settings.pickup_fee || 5) +
                    parseFloat(settings.safe_service_fee || 3.5) +
                    parseFloat(settings.buyer_fee || 2) +
                    ((parseFloat(settings.item_fee_percentage || 5) / 100) * 100)
                  ).toFixed(2)}</strong>
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleSave}>Save Settings</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default GeneralSettings;