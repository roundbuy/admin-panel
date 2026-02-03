import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Divider,
    FormControlLabel,
    Switch,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    InputAdornment,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ColorLens as ColorIcon,
    Upload as UploadIcon,
    Preview as PreviewIcon
} from '@mui/icons-material';

const ColorPicker = ({ value, onChange, label }) => {
    return (
        <TextField
            label={label}
            value={value || '#1E3A8A'}
            onChange={(e) => onChange(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Box
                            sx={{
                                width: 24,
                                height: 24,
                                bgcolor: value || '#1E3A8A',
                                border: '1px solid #ccc',
                                borderRadius: 1,
                                cursor: 'pointer'
                            }}
                        />
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        <Tooltip title="Pick Color">
                            <IconButton size="small" component="label">
                                <ColorIcon fontSize="small" />
                                <input
                                    type="color"
                                    hidden
                                    value={value || '#1E3A8A'}
                                    onChange={(e) => onChange(e.target.value)}
                                />
                            </IconButton>
                        </Tooltip>
                    </InputAdornment>
                )
            }}
        />
    );
};

const CampaignNotificationFormFields = ({ formData, setFormData }) => {
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleButtonActionChange = (buttonField, actionType, actionValue) => {
        const action = { type: actionType };
        if (actionType === 'open_url') {
            action.url = actionValue;
        } else if (actionType === 'open_screen') {
            action.screen = actionValue;
        }
        handleChange(buttonField, action);
    };

    return (
        <Box>
            {/* Collapsed State Section */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Collapsed Notification</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Icon URL"
                                value={formData.collapsed_icon || ''}
                                onChange={(e) => handleChange('collapsed_icon', e.target.value)}
                                fullWidth
                                size="small"
                                placeholder="https://example.com/icon.png or icon-name"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <ColorPicker
                                label="Icon Background Color"
                                value={formData.collapsed_icon_bg_color}
                                onChange={(value) => handleChange('collapsed_icon_bg_color', value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Title"
                                value={formData.collapsed_title || ''}
                                onChange={(e) => handleChange('collapsed_title', e.target.value)}
                                fullWidth
                                size="small"
                                required
                                helperText="Short title for collapsed state"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Message"
                                value={formData.collapsed_message || ''}
                                onChange={(e) => handleChange('collapsed_message', e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
                                size="small"
                                helperText="Brief message for collapsed state"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Timestamp Text (Optional)"
                                value={formData.collapsed_timestamp_text || ''}
                                onChange={(e) => handleChange('collapsed_timestamp_text', e.target.value)}
                                fullWidth
                                size="small"
                                placeholder="e.g., 2min, Just now"
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Expanded State Section */}
            <Accordion defaultExpanded sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Expanded Notification</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Icon URL"
                                value={formData.expanded_icon || ''}
                                onChange={(e) => handleChange('expanded_icon', e.target.value)}
                                fullWidth
                                size="small"
                                placeholder="Leave empty to reuse collapsed icon"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <ColorPicker
                                label="Icon Background Color"
                                value={formData.expanded_icon_bg_color}
                                onChange={(value) => handleChange('expanded_icon_bg_color', value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Title"
                                value={formData.expanded_title || ''}
                                onChange={(e) => handleChange('expanded_title', e.target.value)}
                                fullWidth
                                size="small"
                                placeholder="Leave empty to reuse collapsed title"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Message"
                                value={formData.expanded_message || ''}
                                onChange={(e) => handleChange('expanded_message', e.target.value)}
                                fullWidth
                                multiline
                                rows={3}
                                size="small"
                                helperText="Longer message for expanded state"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}>
                                <Typography variant="caption">Button 1</Typography>
                            </Divider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Button 1 Text"
                                value={formData.expanded_button_1_text || ''}
                                onChange={(e) => handleChange('expanded_button_1_text', e.target.value)}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <ColorPicker
                                label="Button 1 Color"
                                value={formData.expanded_button_1_color}
                                onChange={(value) => handleChange('expanded_button_1_color', value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Button 1 Action Type"
                                value={formData.expanded_button_1_action?.type || 'open_url'}
                                onChange={(e) => handleButtonActionChange('expanded_button_1_action', e.target.value, '')}
                                fullWidth
                                size="small"
                                SelectProps={{ native: true }}
                            >
                                <option value="open_url">Open URL</option>
                                <option value="open_screen">Open Screen</option>
                                <option value="custom">Custom</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label={formData.expanded_button_1_action?.type === 'open_url' ? 'URL' : 'Screen Name'}
                                value={formData.expanded_button_1_action?.url || formData.expanded_button_1_action?.screen || ''}
                                onChange={(e) => handleButtonActionChange(
                                    'expanded_button_1_action',
                                    formData.expanded_button_1_action?.type || 'open_url',
                                    e.target.value
                                )}
                                fullWidth
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}>
                                <Typography variant="caption">Button 2 (Optional)</Typography>
                            </Divider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Button 2 Text"
                                value={formData.expanded_button_2_text || ''}
                                onChange={(e) => handleChange('expanded_button_2_text', e.target.value)}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <ColorPicker
                                label="Button 2 Color"
                                value={formData.expanded_button_2_color}
                                onChange={(value) => handleChange('expanded_button_2_color', value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Button 2 Action Type"
                                value={formData.expanded_button_2_action?.type || 'open_url'}
                                onChange={(e) => handleButtonActionChange('expanded_button_2_action', e.target.value, '')}
                                fullWidth
                                size="small"
                                SelectProps={{ native: true }}
                            >
                                <option value="open_url">Open URL</option>
                                <option value="open_screen">Open Screen</option>
                                <option value="custom">Custom</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label={formData.expanded_button_2_action?.type === 'open_url' ? 'URL' : 'Screen Name'}
                                value={formData.expanded_button_2_action?.url || formData.expanded_button_2_action?.screen || ''}
                                onChange={(e) => handleButtonActionChange(
                                    'expanded_button_2_action',
                                    formData.expanded_button_2_action?.type || 'open_url',
                                    e.target.value
                                )}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Full-Screen Modal Section */}
            <Accordion defaultExpanded sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Full-Screen Modal</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.fullscreen_show_logo || false}
                                        onChange={(e) => handleChange('fullscreen_show_logo', e.target.checked)}
                                    />
                                }
                                label="Show RoundBuy Logo"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Icon URL"
                                value={formData.fullscreen_icon || ''}
                                onChange={(e) => handleChange('fullscreen_icon', e.target.value)}
                                fullWidth
                                size="small"
                                placeholder="Leave empty to reuse from above"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <ColorPicker
                                label="Icon Background Color"
                                value={formData.fullscreen_icon_bg_color}
                                onChange={(value) => handleChange('fullscreen_icon_bg_color', value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Heading"
                                value={formData.fullscreen_heading || ''}
                                onChange={(e) => handleChange('fullscreen_heading', e.target.value)}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Subheading"
                                value={formData.fullscreen_subheading || ''}
                                onChange={(e) => handleChange('fullscreen_subheading', e.target.value)}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                value={formData.fullscreen_description || ''}
                                onChange={(e) => handleChange('fullscreen_description', e.target.value)}
                                fullWidth
                                multiline
                                rows={4}
                                size="small"
                                helperText="Supports HTML for links and formatting"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}>
                                <Typography variant="caption">Primary Button</Typography>
                            </Divider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Primary Button Text"
                                value={formData.fullscreen_primary_button_text || ''}
                                onChange={(e) => handleChange('fullscreen_primary_button_text', e.target.value)}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <ColorPicker
                                label="Primary Button Color"
                                value={formData.fullscreen_primary_button_color}
                                onChange={(value) => handleChange('fullscreen_primary_button_color', value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Primary Button Action Type"
                                value={formData.fullscreen_primary_button_action?.type || 'open_url'}
                                onChange={(e) => handleButtonActionChange('fullscreen_primary_button_action', e.target.value, '')}
                                fullWidth
                                size="small"
                                SelectProps={{ native: true }}
                            >
                                <option value="open_url">Open URL</option>
                                <option value="open_screen">Open Screen</option>
                                <option value="dismiss">Dismiss</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label={formData.fullscreen_primary_button_action?.type === 'open_url' ? 'URL' : 'Screen Name'}
                                value={formData.fullscreen_primary_button_action?.url || formData.fullscreen_primary_button_action?.screen || ''}
                                onChange={(e) => handleButtonActionChange(
                                    'fullscreen_primary_button_action',
                                    formData.fullscreen_primary_button_action?.type || 'open_url',
                                    e.target.value
                                )}
                                fullWidth
                                size="small"
                                disabled={formData.fullscreen_primary_button_action?.type === 'dismiss'}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}>
                                <Typography variant="caption">Secondary Button (Optional)</Typography>
                            </Divider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Secondary Button Text"
                                value={formData.fullscreen_secondary_button_text || ''}
                                onChange={(e) => handleChange('fullscreen_secondary_button_text', e.target.value)}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <ColorPicker
                                label="Secondary Button Color"
                                value={formData.fullscreen_secondary_button_color}
                                onChange={(value) => handleChange('fullscreen_secondary_button_color', value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Secondary Button Action Type"
                                value={formData.fullscreen_secondary_button_action?.type || 'open_url'}
                                onChange={(e) => handleButtonActionChange('fullscreen_secondary_button_action', e.target.value, '')}
                                fullWidth
                                size="small"
                                SelectProps={{ native: true }}
                            >
                                <option value="open_url">Open URL</option>
                                <option value="open_screen">Open Screen</option>
                                <option value="dismiss">Dismiss</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label={formData.fullscreen_secondary_button_action?.type === 'open_url' ? 'URL' : 'Screen Name'}
                                value={formData.fullscreen_secondary_button_action?.url || formData.fullscreen_secondary_button_action?.screen || ''}
                                onChange={(e) => handleButtonActionChange(
                                    'fullscreen_secondary_button_action',
                                    formData.fullscreen_secondary_button_action?.type || 'open_url',
                                    e.target.value
                                )}
                                fullWidth
                                size="small"
                                disabled={formData.fullscreen_secondary_button_action?.type === 'dismiss'}
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Trigger Configuration Section */}
            <Accordion defaultExpanded sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Trigger Configuration</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Trigger Type"
                                value={formData.trigger_type || 'manual'}
                                onChange={(e) => handleChange('trigger_type', e.target.value)}
                                fullWidth
                                size="small"
                                SelectProps={{ native: true }}
                                helperText="How this notification will be triggered"
                            >
                                <option value="manual">Manual (Admin sends manually)</option>
                                <option value="one_time">One-time Scheduled</option>
                                <option value="recurring">Recurring Schedule</option>
                                <option value="event">System Event (Automated)</option>
                            </TextField>
                        </Grid>

                        {/* One-time Trigger Fields */}
                        {formData.trigger_type === 'one_time' && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Scheduled Time"
                                    type="datetime-local"
                                    value={formData.scheduled_at ? new Date(formData.scheduled_at).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => handleChange('scheduled_at', e.target.value)}
                                    fullWidth
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        )}

                        {/* Recurring Trigger Fields */}
                        {formData.trigger_type === 'recurring' && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    label="Recurrence Pattern"
                                    value={formData.recurrence_pattern || 'daily'}
                                    onChange={(e) => handleChange('recurrence_pattern', e.target.value)}
                                    fullWidth
                                    size="small"
                                    SelectProps={{ native: true }}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="every_14_days">Every 14 Days</option>
                                    <option value="every_3_months">Every 3 Months</option>
                                    <option value="every_4_months">Every 4 Months</option>
                                </TextField>
                            </Grid>
                        )}

                        {/* Event Trigger Fields */}
                        {formData.trigger_type === 'event' && (
                            <>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        label="Event Name"
                                        value={formData.trigger_conditions?.event_name || 'signup'}
                                        onChange={(e) => handleChange('trigger_conditions', { ...formData.trigger_conditions, event_name: e.target.value })}
                                        fullWidth
                                        size="small"
                                        SelectProps={{ native: true }}
                                    >
                                        <option value="signup">User Signup</option>
                                        <option value="account_verified">Account Verified</option>
                                        <option value="first_order">First Order Placed</option>
                                        <option value="order_delivered">Order Delivered</option>
                                        <option value="profile_updated">Profile Updated</option>
                                        <option value="seller_approved">Seller Approved</option>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        label="Trigger After (Days)"
                                        value={formData.trigger_conditions?.trigger_offset_days || 0}
                                        onChange={(e) => handleChange('trigger_conditions', { ...formData.trigger_conditions, trigger_offset_days: parseInt(e.target.value) })}
                                        fullWidth
                                        size="small"
                                        SelectProps={{ native: true }}
                                        helperText="How many days after the event to send"
                                    >
                                        <option value={0}>Immediately</option>
                                        {Array.from({ length: 365 }, (_, i) => i + 1).map(day => (
                                            <option key={day} value={day}>{day} Day{day > 1 ? 's' : ''} Later</option>
                                        ))}
                                    </TextField>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Template Variables Help */}
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="subtitle2" gutterBottom>
                    Template Variables
                </Typography>
                <Typography variant="caption">
                    Use these variables in your text: <code>{'{{user_name}}'}</code>, <code>{'{{plan_name}}'}</code>, <code>{'{{discount_amount}}'}</code>
                </Typography>
            </Paper>
        </Box>
    );
};

export default CampaignNotificationFormFields;
