import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Paper, TextField, Button, Grid } from '@mui/material';
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Stripe Enabled"
                value={settings.stripe_enabled || 'false'}
                onChange={(e) => setSettings({ ...settings, stripe_enabled: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Razorpay Enabled"
                value={settings.razorpay_enabled || 'false'}
                onChange={(e) => setSettings({ ...settings, razorpay_enabled: e.target.value })}
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

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleSave}>Save Settings</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default GeneralSettings;